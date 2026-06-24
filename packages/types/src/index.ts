export type UserStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BANNED'
  | 'DELETED';

export interface UserDTO {
  id: string;
  nickname?: string;
  email?: string;
  displayName: string;
  avatarUrl: string | null;
  status?: UserStatus;
  createdAt?: string;
}

export interface AuthUserDTO {
  id: string;
  nickname?: string;
  email?: string;
  displayName: string;
  avatarUrl: string | null;
  status: UserStatus;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDTO extends AuthTokensDTO {
  user: AuthUserDTO;
}

export type VerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface IdentityVerificationStatusDTO {
  expiresAt: string | null;
  provider: string | null;
  rejectionReasonCode: string | null;
  status: VerificationStatus;
  updatedAt: string | null;
  verifiedAt: string | null;
}

export type ContentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNDER_REVIEW'
  | 'HIDDEN'
  | 'DELETED';

export interface ForumDTO {
  description: string | null;
  id: string;
  name: string;
  position: number;
  slug: string;
  threadCount: number;
}

export interface ThreadDTO {
  author: UserDTO;
  commentCount: number;
  content: string;
  contentPreview: string;
  createdAt: string;
  forum: {
    name: string;
    slug: string;
  };
  id: string;
  status: ContentStatus;
  title: string;
  updatedAt: string;
}

export type ThreadListItemDTO = Omit<ThreadDTO, 'content'>;

export interface PaginatedDTO<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CommentDTO {
  id: string;
  threadId: string;
  author: UserDTO;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
