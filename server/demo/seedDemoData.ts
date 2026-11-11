export interface DemoFileItem {
  id: string;
  name: string;
  docId?: string;
  category: string;
  expectedResult: 'GENUINE' | 'MODIFIED' | 'UNVERIFIED';
  description: string;
  filePath: string;
  downloadUrl: string;
}

export class DemoDataManager {
  public static async initDemoData(): Promise<void> {
    // Demo data disabled as requested by user. Clean slate active.
  }

  public static getDemoFiles(): DemoFileItem[] {
    return [];
  }
}
