export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  reminder_on: boolean;
  created_at: string;
};

export type Entry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  items: string[];
  photos: string[]; // storage object paths
  mood: number; // 0..4
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  icon: string;
  owner_id: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string | null;
  invited_name: string | null;
  role: "owner" | "member";
  joined_at: string;
};

export type Heart = {
  entry_id: string;
  user_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  entry_id: string;
  user_id: string;
  body: string | null;
  sticker: string | null;
  created_at: string;
};

export type Friend = {
  user_id: string;
  friend_id: string | null;
  friend_name: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      entries: {
        Row: Entry;
        Insert: Partial<Entry> & { user_id: string; entry_date: string };
        Update: Partial<Entry>;
        Relationships: [];
      };
      groups: {
        Row: Group;
        Insert: Partial<Group> & { name: string; owner_id: string };
        Update: Partial<Group>;
        Relationships: [];
      };
      group_members: {
        Row: GroupMember;
        Insert: Partial<GroupMember> & { group_id: string };
        Update: Partial<GroupMember>;
        Relationships: [];
      };
      hearts: {
        Row: Heart;
        Insert: Partial<Heart> & { entry_id: string; user_id: string };
        Update: Partial<Heart>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> & { entry_id: string; user_id: string };
        Update: Partial<Comment>;
        Relationships: [];
      };
      friends: {
        Row: Friend;
        Insert: Partial<Friend> & { user_id: string; friend_name: string };
        Update: Partial<Friend>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
