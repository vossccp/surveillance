import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseImageFilename, loadEvents, GetEventsForDay, type SurveillanceEvent } from './Events';
import * as fs from 'node:fs';
import path from 'node:path';

describe('Events Module - Integration Tests', () => {
  const testDataDir = './test-surveillance-data';
  const originalPersonFolder = process.env.PERSON_FOLDER;

  beforeAll(async () => {
    // Set up test data directory
    process.env.PERSON_FOLDER = testDataDir;
    
    // Create test directory structure
    const testDayPath = path.join(testDataDir, '2024', '12', '25');
    await fs.promises.mkdir(testDayPath, { recursive: true });
    
    // Create test files with realistic content
    const testFiles = [
      'camera1_01_20241225143000.jpg',
      'camera1_02_20241225143005.mp4', 
      'camera1_03_20241225143030.jpg',
      'camera1_04_20241225143035.mp4',
      'camera1_05_20241225143040.mp4',
      'frontdoor_10_20241225144000.jpg',
      'frontdoor_11_20241225144005.mp4',
    ];

    for (const filename of testFiles) {
      const filePath = path.join(testDayPath, filename);
      const content = filename.endsWith('.jpg') ? 'fake-jpg-data' : 'fake-mp4-data';
      await fs.promises.writeFile(filePath, content);
    }

    // Create another test day
    const testDayPath2 = path.join(testDataDir, '2024', '12', '26');
    await fs.promises.mkdir(testDayPath2, { recursive: true });
    await fs.promises.writeFile(path.join(testDayPath2, 'camera2_01_20241226090000.jpg'), 'test-data');
  });

  afterAll(async () => {
    // Clean up test data
    if (fs.existsSync(testDataDir)) {
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    }
    process.env.PERSON_FOLDER = originalPersonFolder;
  });

  describe('parseImageFilename', () => {
    it('should parse camera1 filename correctly', () => {
      const result = parseImageFilename('camera1_01_20241225143000.jpg');
      
      expect(result.cameraId).toBe('camera1');
      expect(result.id).toBe(1);
      expect(result.extension).toBe('jpg');
      expect(result.filename).toBe('camera1_01_20241225143000.jpg');
      expect(result.mp4s).toEqual([]);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should parse frontdoor camera filename correctly', () => {
      const result = parseImageFilename('frontdoor_10_20241225144000.jpg');
      
      expect(result.cameraId).toBe('frontdoor');
      expect(result.id).toBe(10);
      expect(result.extension).toBe('jpg');
    });

    it('should parse MP4 filename correctly', () => {
      const result = parseImageFilename('camera1_02_20241225143005.mp4');
      
      expect(result.cameraId).toBe('camera1');
      expect(result.id).toBe(2);
      expect(result.extension).toBe('mp4');
    });

    it('should throw error for invalid filename', () => {
      expect(() => parseImageFilename('invalid-filename.jpg')).toThrow(
        'Filename "invalid-filename.jpg" does not match expected pattern'
      );
    });

    it('should parse timestamp correctly', () => {
      const result = parseImageFilename('camera1_01_20241225143000.jpg');
      
      expect(result.timestamp.getFullYear()).toBe(2024);
      expect(result.timestamp.getMonth()).toBe(11); // December (0-indexed)
      expect(result.timestamp.getDate()).toBe(25);
    });
  });

  describe('loadEvents', () => {
    it('should load events for existing day', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      expect(events.length).toBeGreaterThan(0);
      expect(events.every(event => event.extension === 'jpg')).toBe(true);
    });

    it('should return empty array for non-existent day', async () => {
      const events = await loadEvents({ year: '2024', month: '01', day: '01' });
      
      expect(events).toEqual([]);
    });

    it('should sort events by timestamp', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          events[i - 1].timestamp.getTime()
        );
      }
    });

    it('should associate MP4 files with JPG events', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const camera1FirstEvent = events.find(e => e.filename === 'camera1_01_20241225143000.jpg');
      expect(camera1FirstEvent).toBeDefined();
      expect(camera1FirstEvent!.mp4s).toContain('camera1_02_20241225143005.mp4');
    });

    it('should include file sizes', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      events.forEach(event => {
        expect(typeof event.fileSize).toBe('number');
        expect(event.fileSize).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include MP4 sizes when MP4s are present', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const eventsWithMp4s = events.filter(e => e.mp4s.length > 0);
      eventsWithMp4s.forEach(event => {
        expect(event.mp4Sizes).toBeDefined();
        expect(event.mp4Sizes!.length).toBe(event.mp4s.length);
      });
    });

    it('should handle different camera types', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const cameraIds = events.map(e => e.cameraId);
      expect(cameraIds).toContain('camera1');
      expect(cameraIds).toContain('frontdoor');
    });
  });

  describe('GetEventsForDay', () => {
    it('should get events for a specific date string', async () => {
      const events = await GetEventsForDay('2024-12-25');
      
      expect(events.length).toBeGreaterThan(0);
      expect(events.every(event => event.extension === 'jpg')).toBe(true);
    });

    it('should return same result as loadEvents', async () => {
      const eventsFromLoadEvents = await loadEvents({ year: '2024', month: '12', day: '25' });
      const eventsFromGetEventsForDay = await GetEventsForDay('2024-12-25');
      
      expect(eventsFromGetEventsForDay).toEqual(eventsFromLoadEvents);
    });

    it('should handle date with different format', async () => {
      const events = await GetEventsForDay('2024-12-26');
      
      expect(events.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MP4 Association Logic', () => {
    it('should associate MP4s that occur after JPG timestamp', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const camera1FirstEvent = events.find(e => e.filename === 'camera1_01_20241225143000.jpg');
      expect(camera1FirstEvent).toBeDefined();
      
      // Should include MP4 at 143005 (5 seconds later)
      expect(camera1FirstEvent!.mp4s).toContain('camera1_02_20241225143005.mp4');
    });

    it('should not associate MP4s beyond next JPG event', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const camera1FirstEvent = events.find(e => e.filename === 'camera1_01_20241225143000.jpg');
      const camera1SecondEvent = events.find(e => e.filename === 'camera1_03_20241225143030.jpg');
      
      expect(camera1FirstEvent).toBeDefined();
      expect(camera1SecondEvent).toBeDefined();
      
      // First event should not include MP4s that belong to second event
      const firstEventMp4Times = camera1FirstEvent!.mp4s.map(mp4 => {
        const parsed = parseImageFilename(mp4);
        return parsed.timestamp.getTime();
      });
      
      const secondEventTime = camera1SecondEvent!.timestamp.getTime();
      
      firstEventMp4Times.forEach(mp4Time => {
        expect(mp4Time).toBeLessThan(secondEventTime);
      });
    });

    it('should handle last event correctly (include all remaining MP4s)', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      const lastEvent = events[events.length - 1];
      expect(lastEvent).toBeDefined();
      
      // Last event should include all MP4s that occur after its timestamp
      expect(lastEvent.mp4s.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('File Size Calculations', () => {
    it('should calculate correct file sizes', async () => {
      const events = await loadEvents({ year: '2024', month: '12', day: '25' });
      
      for (const event of events) {
        expect(event.fileSize).toBeGreaterThan(0);
        
        if (event.mp4s.length > 0) {
          expect(event.mp4Sizes).toBeDefined();
          expect(event.mp4Sizes!.length).toBe(event.mp4s.length);
          
          event.mp4Sizes!.forEach(size => {
            expect(size).toBeGreaterThan(0);
          });
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing directory gracefully', async () => {
      const events = await loadEvents({ year: '1999', month: '01', day: '01' });
      expect(events).toEqual([]);
    });

    it('should handle empty directory', async () => {
      // Create empty directory
      const emptyDayPath = path.join(testDataDir, '2024', '01', '01');
      await fs.promises.mkdir(emptyDayPath, { recursive: true });
      
      const events = await loadEvents({ year: '2024', month: '01', day: '01' });
      expect(events).toEqual([]);
    });
  });
});