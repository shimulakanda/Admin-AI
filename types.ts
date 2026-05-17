
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEPT_OFFICER = 'DEPT_OFFICER',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT'
}

export enum DocType {
  APPLICATION = 'APPLICATION',
  NOTICE = 'NOTICE',
  RECOMMENDATION = 'RECOMMENDATION',
  EMAIL = 'EMAIL',
  EXTERNAL_RECORD = 'EXTERNAL_RECORD',
  DEPARTMENTAL_FILE = 'DEPARTMENTAL_FILE'
}

export enum DocCategory {
  ACADEMIC = 'Academic',
  FINANCIAL = 'Financial',
  PERSONNEL = 'Personnel',
  LEGAL = 'Legal',
  GENERAL = 'General'
}

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  SENT = 'SENT',
  TRASH = 'TRASH'
}

export enum TicketCategory {
  EMAIL_RESOLUTION = 'Email Issue Resolution',
  HR = 'HR Issues',
  ACCOUNTS = 'Accounts Issues',
  EXAM_CLEARANCE = 'Exam Clearance Issues',
  BILL_PROCESSING = 'Bill Processing Issues',
  GENERAL = 'General Administrative Issues'
}

export interface Attachment {
  name: string;
  type: string; // mime type
  data: string; // base64
}

export interface UniDocument {
  id: string;
  title: string;
  type: DocType;
  category: DocCategory;
  department: string;
  author: string;
  date: string;
  refNo: string;
  content: string;
  status: Status;
  attachments?: Attachment[];
  recipients?: string[]; // Multiple recipients support
  sentAt?: string;
  metadata?: string[];
}

export interface Ticket {
  id: string;
  title: string;
  category: TicketCategory;
  description: string;
  status: Status;
  assignedTo: string;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  history: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  agenda: string;
  minutes?: string;
  participants: string[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  comments?: string[];
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  reminderEnabled: boolean;
  category: string;
}

export interface AppNotification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  type: 'MENTION' | 'UPDATE' | 'ALERT';
  author: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  password?: string;
  avatar?: string; // base64 image
}

export interface DeptFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface DeptFile {
  id: string;
  folderId: string;
  title: string;
  date: string;
  refNo: string;
  attachments: Attachment[];
  createdAt: string;
}

