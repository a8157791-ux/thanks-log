export type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  reminder_on: boolean;
  default_fridge_group_id: string | null;
  default_record_group_id: string | null;
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

export type FriendInvite = {
  id: string;
  inviter_id: string;
  inviter_name: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  accepted_by: string | null;
  accepted_at: string | null;
  created_at: string;
  expires_at: string;
};

export type FridgeZone = "freezer" | "fridge" | "kimchi" | "room" | "seasoning";

export type FridgeItem = {
  id: string;
  user_id: string;
  group_id: string | null;
  zone: FridgeZone;
  name: string;
  created_at: string;
};

export type SavedRecipe = {
  id: string;
  user_id: string;
  name: string;
  minutes: number;
  matched: string[];
  missing: string[];
  link: string;
  created_at: string;
};

export type ShoppingItem = {
  id: string;
  user_id: string;
  name: string;
  done: boolean;
  created_at: string;
};

export type MenuIdea = {
  id: string;
  user_id: string;
  note: string;
  created_at: string;
};

export type PassedRecipe = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type ScheduleItem = {
  id: string;
  user_id: string;
  group_id: string | null;
  title: string;
  event_date: string; // YYYY-MM-DD
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
      friend_invites: {
        Row: FriendInvite;
        Insert: Partial<FriendInvite> & { inviter_id: string; inviter_name: string; token: string };
        Update: Partial<FriendInvite>;
        Relationships: [];
      };
      fridge_items: {
        Row: FridgeItem;
        Insert: Partial<FridgeItem> & { user_id: string; zone: FridgeZone; name: string };
        Update: Partial<FridgeItem>;
        Relationships: [];
      };
      saved_recipes: {
        Row: SavedRecipe;
        Insert: Partial<SavedRecipe> & { user_id: string; name: string; link: string };
        Update: Partial<SavedRecipe>;
        Relationships: [];
      };
      shopping_items: {
        Row: ShoppingItem;
        Insert: Partial<ShoppingItem> & { user_id: string; name: string };
        Update: Partial<ShoppingItem>;
        Relationships: [];
      };
      menu_ideas: {
        Row: MenuIdea;
        Insert: Partial<MenuIdea> & { user_id: string; note: string };
        Update: Partial<MenuIdea>;
        Relationships: [];
      };
      passed_recipes: {
        Row: PassedRecipe;
        Insert: Partial<PassedRecipe> & { user_id: string; name: string };
        Update: Partial<PassedRecipe>;
        Relationships: [];
      };
      schedule_items: {
        Row: ScheduleItem;
        Insert: Partial<ScheduleItem> & { user_id: string; title: string; event_date: string };
        Update: Partial<ScheduleItem>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_invite_preview: {
        Args: { p_token: string };
        Returns: { inviter_id: string; inviter_name: string; status: string }[];
      };
      accept_friend_invite: {
        Args: { p_token: string };
        Returns: string;
      };
    };
  };
};
