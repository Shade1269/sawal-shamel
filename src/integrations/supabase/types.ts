export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      channel_locks: {
        Row: {
          channel_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          locked_by: string
          reason: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_by: string
          reason?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_by?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_locks_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_locks_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string | null
          id: string
          joined_at: string
          last_read_at: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_locked: boolean | null
          name: string
          owner_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_locked?: boolean | null
          name: string
          owner_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_locked?: boolean | null
          name?: string
          owner_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_payouts: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          status: string
          total_amount_sar: number
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          status?: string
          total_amount_sar?: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_amount_sar?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount_sar: number
          commission_rate: number
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount_sar: number
          commission_rate: number
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount_sar?: number
          commission_rate?: number
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_log: {
        Row: {
          actor_id: string | null
          created_at: string
          data: Json | null
          event: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          event: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          data?: Json | null
          event?: string
          id?: string
        }
        Relationships: []
      }
      leaderboard_weekly: {
        Row: {
          affiliate_id: string
          id: string
          points: number
          rank: number | null
          week_no: number
          year_no: number
        }
        Insert: {
          affiliate_id: string
          id?: string
          points: number
          rank?: number | null
          week_no: number
          year_no: number
        }
        Update: {
          affiliate_id?: string
          id?: string
          points?: number
          rank?: number | null
          week_no?: number
          year_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_weekly_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          business_name: string | null
          created_at: string
          default_commission_rate: number
          id: string
          profile_id: string
          updated_at: string
          vat_enabled: boolean
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          default_commission_rate?: number
          id?: string
          profile_id: string
          updated_at?: string
          vat_enabled?: boolean
        }
        Update: {
          business_name?: string | null
          created_at?: string
          default_commission_rate?: number
          id?: string
          profile_id?: string
          updated_at?: string
          vat_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "merchants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_pinned: boolean | null
          message_type: string
          pinned_at: string | null
          pinned_by: string | null
          reply_to_message_id: string | null
          sender_id: string | null
          status: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total_sar: number
          merchant_id: string
          order_id: string
          product_id: string
          quantity: number
          title_snapshot: string | null
          unit_price_sar: number
        }
        Insert: {
          id?: string
          line_total_sar: number
          merchant_id: string
          order_id: string
          product_id: string
          quantity: number
          title_snapshot?: string | null
          unit_price_sar: number
        }
        Update: {
          id?: string
          line_total_sar?: number
          merchant_id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          title_snapshot?: string | null
          unit_price_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          payment_method: string
          shipping_address: Json
          shop_id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_sar: number
          total_sar: number
          updated_at: string
          vat_sar: number
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          payment_method: string
          shipping_address: Json
          shop_id: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar?: number
          total_sar?: number
          updated_at?: string
          vat_sar?: number
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          payment_method?: string
          shipping_address?: Json
          shop_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar?: number
          total_sar?: number
          updated_at?: string
          vat_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_sar: number | null
          created_at: string
          id: string
          order_id: string
          provider: string | null
          provider_ref: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_sar?: number | null
          created_at?: string
          id?: string
          order_id: string
          provider?: string | null
          provider_ref?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_sar?: number | null
          created_at?: string
          id?: string
          order_id?: string
          provider?: string | null
          provider_ref?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      points_events: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          meta: Json | null
          points: number
          type: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          meta?: Json | null
          points: number
          type: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          meta?: Json | null
          points?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_library: {
        Row: {
          commission_amount: number
          id: string
          is_featured: boolean
          is_visible: boolean
          product_id: string
          shop_id: string
          sort_index: number
        }
        Insert: {
          commission_amount?: number
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          product_id: string
          shop_id: string
          sort_index?: number
        }
        Update: {
          commission_amount?: number
          id?: string
          is_featured?: boolean
          is_visible?: boolean
          product_id?: string
          shop_id?: string
          sort_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_library_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_library_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          option1_name: string | null
          option1_value: string | null
          option2_name: string | null
          option2_value: string | null
          price_modifier: number | null
          product_id: string
          sku: string | null
          stock: number
          updated_at: string
          variant_type: string
          variant_value: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          option1_name?: string | null
          option1_value?: string | null
          option2_name?: string | null
          option2_value?: string | null
          price_modifier?: number | null
          product_id: string
          sku?: string | null
          stock?: number
          updated_at?: string
          variant_type: string
          variant_value: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          option1_name?: string | null
          option1_value?: string | null
          option2_name?: string | null
          option2_value?: string | null
          price_modifier?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
          updated_at?: string
          variant_type?: string
          variant_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_variants_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes_schema: Json | null
          category: string | null
          commission_rate: number | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          image_urls: string[] | null
          is_active: boolean
          last_viewed_at: string | null
          merchant_id: string
          price_sar: number
          shop_id: string | null
          stock: number
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          attributes_schema?: Json | null
          category?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          last_viewed_at?: string | null
          merchant_id: string
          price_sar: number
          shop_id?: string | null
          stock?: number
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          attributes_schema?: Json | null
          category?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          last_viewed_at?: string | null
          merchant_id?: string
          price_sar?: number
          shop_id?: string | null
          stock?: number
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          created_shops_count: number | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_activity_at: string | null
          phone: string | null
          points: number
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_shops_count?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_shops_count?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings_extended: {
        Row: {
          business_hours: Json | null
          created_at: string | null
          currency: string | null
          id: string
          notification_settings: Json | null
          payment_methods: Json | null
          shipping_settings: Json | null
          shop_id: string
          social_links: Json | null
          tax_rate: number | null
          theme_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          business_hours?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notification_settings?: Json | null
          payment_methods?: Json | null
          shipping_settings?: Json | null
          shop_id: string
          social_links?: Json | null
          tax_rate?: number | null
          theme_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_hours?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notification_settings?: Json | null
          payment_methods?: Json | null
          shipping_settings?: Json | null
          shop_id?: string
          social_links?: Json | null
          tax_rate?: number | null
          theme_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_settings_extended_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          last_activity_at: string | null
          logo_url: string | null
          owner_id: string
          settings: Json | null
          slug: string
          theme: string
          total_orders: number | null
          total_products: number | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_activity_at?: string | null
          logo_url?: string | null
          owner_id: string
          settings?: Json | null
          slug: string
          theme?: string
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_activity_at?: string | null
          logo_url?: string | null
          owner_id?: string
          settings?: Json | null
          slug?: string
          theme?: string
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          payment_providers: Json | null
          shipping_companies: Json | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_providers?: Json | null
          shipping_companies?: Json | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_providers?: Json | null
          shipping_companies?: Json | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          shop_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          shop_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          shop_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_by: string
          channel_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          channel_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          channel_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mutes: {
        Row: {
          channel_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          muted_by: string
          reason: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          muted_by: string
          reason?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          muted_by?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mutes_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mutes_muted_by_fkey"
            columns: ["muted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          expires_at: string | null
          id: string
          last_saved_at: string | null
          session_data: Json | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          last_saved_at?: string | null
          session_data?: Json | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          last_saved_at?: string | null
          session_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_otp: {
        Row: {
          attempts: number
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      zoho_integration: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          organization_id: string | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          organization_id?: string | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          organization_id?: string | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_integration_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_product_mapping: {
        Row: {
          created_at: string
          id: string
          local_product_id: string
          shop_id: string
          zoho_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          local_product_id: string
          shop_id: string
          zoho_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          local_product_id?: string
          shop_id?: string
          zoho_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_product_mapping_local_product_id_fkey"
            columns: ["local_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zoho_product_mapping_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_sync_settings: {
        Row: {
          auto_sync_enabled: boolean
          created_at: string
          id: string
          last_auto_sync_at: string | null
          shop_id: string
          sync_frequency: string
          updated_at: string
        }
        Insert: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_auto_sync_at?: string | null
          shop_id: string
          sync_frequency?: string
          updated_at?: string
        }
        Update: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_auto_sync_at?: string | null
          shop_id?: string
          sync_frequency?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_sync_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_shop: {
        Args: { p_shop_name: string; p_shop_slug?: string; p_user_id: string }
        Returns: string
      }
      debug_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          auth_user_id: string
          current_auth_uid: string
          profile_id: string
        }[]
      }
      get_channel_member_count: {
        Args: { channel_uuid: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_email: string
        }
        Returns: Json
      }
    }
    Enums: {
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELED"
        | "RETURNED"
      user_role: "affiliate" | "merchant" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
        "RETURNED",
      ],
      user_role: ["affiliate", "merchant", "admin", "moderator"],
    },
  },
} as const
