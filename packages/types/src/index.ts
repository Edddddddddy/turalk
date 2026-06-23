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

export interface ThreadDTO {
  id: string;
  forumId: string;
  author: UserDTO;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
