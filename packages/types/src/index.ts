export interface UserDTO {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
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
