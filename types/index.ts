export interface SpreadsheetDocument {
  id: string;
  title: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[];
}

