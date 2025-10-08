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
      admin_order_reviews: {
        Row: {
          admin_notes: string | null
          affiliate_store_id: string | null
          created_at: string
          id: string
          merchant_id: string
          order_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_store_id?: string | null
          created_at?: string
          id?: string
          merchant_id: string
          order_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_store_id?: string | null
          created_at?: string
          id?: string
          merchant_id?: string
          order_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_order_reviews_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_order_reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_order_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_order_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_order_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_analytics_events: {
        Row: {
          affiliate_store_id: string | null
          created_at: string
          device_info: Json | null
          event_data: Json
          event_name: string
          event_type: string
          geo_location: Json | null
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer_url: string | null
          session_id: string | null
          store_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          created_at?: string
          device_info?: Json | null
          event_data?: Json
          event_name: string
          event_type: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          store_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          created_at?: string
          device_info?: Json | null
          event_data?: Json
          event_name?: string
          event_type?: string
          geo_location?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          store_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_coupon_usage: {
        Row: {
          coupon_id: string | null
          customer_id: string | null
          discount_applied: number
          id: string
          ip_address: unknown | null
          order_id: string | null
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          coupon_id?: string | null
          customer_id?: string | null
          discount_applied: number
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          coupon_id?: string | null
          customer_id?: string | null
          discount_applied?: number
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "affiliate_coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_coupons: {
        Row: {
          affiliate_store_id: string | null
          coupon_code: string
          coupon_name: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          target_id: string | null
          target_type: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          coupon_code: string
          coupon_name: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          coupon_code?: string
          coupon_name?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_coupons_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payment_info: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          iban: string | null
          id: string
          preferred_payment_method: string | null
          profile_id: string
          stc_pay_number: string | null
          updated_at: string
          wallet_number: string | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          preferred_payment_method?: string | null
          profile_id: string
          stc_pay_number?: string | null
          updated_at?: string
          wallet_number?: string | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          preferred_payment_method?: string | null
          profile_id?: string
          stc_pay_number?: string | null
          updated_at?: string
          wallet_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payment_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payment_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          added_at: string | null
          affiliate_store_id: string | null
          commission_rate: number | null
          custom_price_sar: number | null
          id: string
          is_visible: boolean
          price_set_at: string | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          added_at?: string | null
          affiliate_store_id?: string | null
          commission_rate?: number | null
          custom_price_sar?: number | null
          id?: string
          is_visible?: boolean
          price_set_at?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          added_at?: string | null
          affiliate_store_id?: string | null
          commission_rate?: number | null
          custom_price_sar?: number | null
          id?: string
          is_visible?: boolean
          price_set_at?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_products_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_store_settings: {
        Row: {
          category_display_style: string | null
          created_at: string
          featured_categories: Json | null
          hero_cta_color: string | null
          hero_cta_text: string | null
          hero_description: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          store_analytics: Json | null
          store_id: string
          updated_at: string
        }
        Insert: {
          category_display_style?: string | null
          created_at?: string
          featured_categories?: Json | null
          hero_cta_color?: string | null
          hero_cta_text?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          store_analytics?: Json | null
          store_id: string
          updated_at?: string
        }
        Update: {
          category_display_style?: string | null
          created_at?: string
          featured_categories?: Json | null
          hero_cta_color?: string | null
          hero_cta_text?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          store_analytics?: Json | null
          store_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_store_themes: {
        Row: {
          applied_at: string | null
          created_at: string | null
          custom_config: Json | null
          id: string
          is_active: boolean | null
          store_id: string | null
          theme_id: string | null
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_active?: boolean | null
          store_id?: string | null
          theme_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_active?: boolean | null
          store_id?: string | null
          theme_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_store_themes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_store_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "store_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_stores: {
        Row: {
          bio: string | null
          created_at: string | null
          current_theme_id: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          profile_id: string | null
          store_name: string
          store_slug: string
          theme: Database["public"]["Enums"]["theme_type"]
          total_orders: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          current_theme_id?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          profile_id?: string | null
          store_name: string
          store_slug: string
          theme?: Database["public"]["Enums"]["theme_type"]
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          current_theme_id?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          profile_id?: string | null
          store_name?: string
          store_slug?: string
          theme?: Database["public"]["Enums"]["theme_type"]
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_stores_current_theme_id_fkey"
            columns: ["current_theme_id"]
            isOneToOne: false
            referencedRelation: "store_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_stores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_stores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alliance_members: {
        Row: {
          alliance_id: string
          contribution_points: number
          created_at: string
          id: string
          is_active: boolean
          joined_at: string
          last_activity_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          alliance_id: string
          contribution_points?: number
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          last_activity_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          alliance_id?: string
          contribution_points?: number
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          last_activity_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alliance_members_alliance_id_fkey"
            columns: ["alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alliance_reports: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string
          id: string
          report_type: string
          reported_alliance_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description: string
          id?: string
          report_type: string
          reported_alliance_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string
          id?: string
          report_type?: string
          reported_alliance_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alliance_reports_reported_alliance_id_fkey"
            columns: ["reported_alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliance_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alliance_weekly_leaderboard: {
        Row: {
          active_members: number
          alliance_id: string
          castle_controlled: boolean | null
          created_at: string
          id: string
          rank: number | null
          rank_change: number | null
          rewards_earned: Json | null
          total_orders: number
          total_points: number
          total_sales: number
          updated_at: string
          week_number: number
          year_number: number
        }
        Insert: {
          active_members?: number
          alliance_id: string
          castle_controlled?: boolean | null
          created_at?: string
          id?: string
          rank?: number | null
          rank_change?: number | null
          rewards_earned?: Json | null
          total_orders?: number
          total_points?: number
          total_sales?: number
          updated_at?: string
          week_number: number
          year_number: number
        }
        Update: {
          active_members?: number
          alliance_id?: string
          castle_controlled?: boolean | null
          created_at?: string
          id?: string
          rank?: number | null
          rank_change?: number | null
          rewards_earned?: Json | null
          total_orders?: number
          total_points?: number
          total_sales?: number
          updated_at?: string
          week_number?: number
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "alliance_weekly_leaderboard_alliance_id_fkey"
            columns: ["alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
        ]
      }
      alliances: {
        Row: {
          castle_control_duration: number | null
          castle_controlled_at: string | null
          created_at: string
          description: string | null
          id: string
          last_logo_change: string | null
          last_name_change: string | null
          leader_id: string
          logo_url: string | null
          max_members: number
          member_count: number
          name: string
          slug: string
          status: Database["public"]["Enums"]["alliance_status"]
          theme: Database["public"]["Enums"]["theme_type"]
          total_points: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          castle_control_duration?: number | null
          castle_controlled_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_logo_change?: string | null
          last_name_change?: string | null
          leader_id: string
          logo_url?: string | null
          max_members?: number
          member_count?: number
          name: string
          slug: string
          status?: Database["public"]["Enums"]["alliance_status"]
          theme?: Database["public"]["Enums"]["theme_type"]
          total_points?: number
          total_sales?: number
          updated_at?: string
        }
        Update: {
          castle_control_duration?: number | null
          castle_controlled_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_logo_change?: string | null
          last_name_change?: string | null
          leader_id?: string
          logo_url?: string | null
          max_members?: number
          member_count?: number
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["alliance_status"]
          theme?: Database["public"]["Enums"]["theme_type"]
          total_points?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alliances_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alliances_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atlantis_chat_points: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points_earned: number
          room_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number
          room_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points_earned?: number
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlantis_chat_points_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlantis_chat_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlantis_chat_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_scope: string
          backup_status: string
          backup_type: string
          checksum: string
          created_at: string
          encryption_status: string
          error_message: string | null
          file_path: string
          file_size_bytes: number | null
          id: string
          retention_until: string
          verified_at: string | null
        }
        Insert: {
          backup_scope: string
          backup_status?: string
          backup_type: string
          checksum: string
          created_at?: string
          encryption_status?: string
          error_message?: string | null
          file_path: string
          file_size_bytes?: number | null
          id?: string
          retention_until: string
          verified_at?: string | null
        }
        Update: {
          backup_scope?: string
          backup_status?: string
          backup_type?: string
          checksum?: string
          created_at?: string
          encryption_status?: string
          error_message?: string | null
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          retention_until?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      banner_analytics: {
        Row: {
          banner_id: string
          browser_type: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          page_url: string | null
          referrer_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          browser_type?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          browser_type?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_analytics_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "promotional_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_triggers: {
        Row: {
          actions: Json
          affiliate_store_id: string | null
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          store_id: string | null
          trigger_description: string | null
          trigger_name: string
          triggered_count: number | null
          updated_at: string
        }
        Insert: {
          actions?: Json
          affiliate_store_id?: string | null
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          store_id?: string | null
          trigger_description?: string | null
          trigger_name: string
          triggered_count?: number | null
          updated_at?: string
        }
        Update: {
          actions?: Json
          affiliate_store_id?: string | null
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          store_id?: string | null
          trigger_description?: string | null
          trigger_name?: string
          triggered_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bundle_offers: {
        Row: {
          affiliate_store_id: string | null
          bundle_price: number
          bundle_products: Json
          created_at: string | null
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          name: string
          original_price: number
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          bundle_price?: number
          bundle_products?: Json
          created_at?: string | null
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name: string
          original_price?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          bundle_price?: number
          bundle_products?: Json
          created_at?: string | null
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
          original_price?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_banners: {
        Row: {
          banner_id: string
          campaign_id: string
          created_at: string | null
          display_order: number | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          banner_id: string
          campaign_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          banner_id?: string
          campaign_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_banners_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "promotional_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_usage: {
        Row: {
          campaign_id: string | null
          customer_id: string | null
          discount_applied: number
          id: string
          ip_address: unknown | null
          order_id: string | null
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          customer_id?: string | null
          discount_applied?: number
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          customer_id?: string | null
          discount_applied?: number
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_usage_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          cart_id: string
          id: string
          product_id: string
          quantity: number
          selected_variants: Json | null
          total_price_sar: number | null
          unit_price_sar: number
          updated_at: string
        }
        Insert: {
          added_at?: string
          cart_id: string
          id?: string
          product_id: string
          quantity: number
          selected_variants?: Json | null
          total_price_sar?: number | null
          unit_price_sar: number
          updated_at?: string
        }
        Update: {
          added_at?: string
          cart_id?: string
          id?: string
          product_id?: string
          quantity?: number
          selected_variants?: Json | null
          total_price_sar?: number | null
          unit_price_sar?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      castle_control: {
        Row: {
          alliance_id: string
          challenge_won: string | null
          controlled_from: string
          controlled_until: string
          created_at: string
          id: string
          is_current: boolean
          points_earned: number
          week_number: number
          year_number: number
        }
        Insert: {
          alliance_id: string
          challenge_won?: string | null
          controlled_from?: string
          controlled_until: string
          created_at?: string
          id?: string
          is_current?: boolean
          points_earned?: number
          week_number: number
          year_number: number
        }
        Update: {
          alliance_id?: string
          challenge_won?: string | null
          controlled_from?: string
          controlled_until?: string
          created_at?: string
          id?: string
          is_current?: boolean
          points_earned?: number
          week_number?: number
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "castle_control_alliance_id_fkey"
            columns: ["alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participations: {
        Row: {
          alliance_id: string
          bonus_earned: number
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_progress: number
          final_score: number
          id: string
          rank: number | null
          updated_at: string
        }
        Insert: {
          alliance_id: string
          bonus_earned?: number
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          final_score?: number
          id?: string
          rank?: number | null
          updated_at?: string
        }
        Update: {
          alliance_id?: string
          bonus_earned?: number
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          final_score?: number
          id?: string
          rank?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_alliance_id_fkey"
            columns: ["alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
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
          {
            foreignKeyName: "channel_locks_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
          {
            foreignKeyName: "channels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_pinned: boolean
          mentions: string[] | null
          message_type: string
          pinned_at: string | null
          pinned_by: string | null
          reactions: Json | null
          reply_to_id: string | null
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          mentions?: string[] | null
          message_type?: string
          pinned_at?: string | null
          pinned_by?: string | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          mentions?: string[] | null
          message_type?: string
          pinned_at?: string | null
          pinned_by?: string | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_members: number | null
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
          max_members?: number | null
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
          max_members?: number | null
          name?: string
          owner_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content_blocks_library: {
        Row: {
          block_category: string
          block_description: string | null
          block_name: string
          block_template: Json
          created_at: string
          created_by: string | null
          id: string
          is_premium: boolean
          preview_image_url: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          block_category?: string
          block_description?: string | null
          block_name: string
          block_template: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_premium?: boolean
          preview_image_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          block_category?: string
          block_description?: string | null
          block_name?: string
          block_template?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_premium?: boolean
          preview_image_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      cms_content_widgets: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          page_id: string
          section_id: string | null
          sort_order: number
          updated_at: string
          widget_config: Json
          widget_data: Json
          widget_name: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          page_id: string
          section_id?: string | null
          sort_order?: number
          updated_at?: string
          widget_config?: Json
          widget_data?: Json
          widget_name: string
          widget_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          page_id?: string
          section_id?: string | null
          sort_order?: number
          updated_at?: string
          widget_config?: Json
          widget_data?: Json
          widget_name?: string
          widget_type?: string
        }
        Relationships: []
      }
      cms_custom_pages: {
        Row: {
          affiliate_store_id: string | null
          created_at: string
          id: string
          is_homepage: boolean
          is_published: boolean
          meta_description: string | null
          meta_keywords: string[] | null
          page_content: Json
          page_settings: Json
          page_slug: string
          page_title: string
          published_at: string | null
          seo_score: number | null
          store_id: string | null
          template_id: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          affiliate_store_id?: string | null
          created_at?: string
          id?: string
          is_homepage?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          page_content?: Json
          page_settings?: Json
          page_slug: string
          page_title: string
          published_at?: string | null
          seo_score?: number | null
          store_id?: string | null
          template_id?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          affiliate_store_id?: string | null
          created_at?: string
          id?: string
          is_homepage?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_keywords?: string[] | null
          page_content?: Json
          page_settings?: Json
          page_slug?: string
          page_title?: string
          published_at?: string | null
          seo_score?: number | null
          store_id?: string | null
          template_id?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      cms_page_revisions: {
        Row: {
          change_description: string | null
          content_snapshot: Json
          created_at: string
          created_by: string | null
          id: string
          page_id: string
          revision_number: number
        }
        Insert: {
          change_description?: string | null
          content_snapshot: Json
          created_at?: string
          created_by?: string | null
          id?: string
          page_id: string
          revision_number: number
        }
        Update: {
          change_description?: string | null
          content_snapshot?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          page_id?: string
          revision_number?: number
        }
        Relationships: []
      }
      cms_page_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_premium: boolean
          preview_image_url: string | null
          template_category: string
          template_data: Json
          template_description: string | null
          template_name: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          preview_image_url?: string | null
          template_category?: string
          template_data?: Json
          template_description?: string | null
          template_name: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          preview_image_url?: string | null
          template_category?: string
          template_data?: Json
          template_description?: string | null
          template_name?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      cms_seo_analytics: {
        Row: {
          click_through_rate: number | null
          clicks: number
          created_at: string
          date_recorded: string
          id: string
          impressions: number
          keyword: string
          page_id: string
          ranking_position: number | null
          search_volume: number | null
        }
        Insert: {
          click_through_rate?: number | null
          clicks?: number
          created_at?: string
          date_recorded?: string
          id?: string
          impressions?: number
          keyword: string
          page_id: string
          ranking_position?: number | null
          search_volume?: number | null
        }
        Update: {
          click_through_rate?: number | null
          clicks?: number
          created_at?: string
          date_recorded?: string
          id?: string
          impressions?: number
          keyword?: string
          page_id?: string
          ranking_position?: number | null
          search_volume?: number | null
        }
        Relationships: []
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
          {
            foreignKeyName: "commission_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          affiliate_profile_id: string | null
          amount_sar: number
          commission_rate: number
          confirmed_at: string | null
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          affiliate_profile_id?: string | null
          amount_sar: number
          commission_rate: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          affiliate_profile_id?: string | null
          amount_sar?: number
          commission_rate?: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          paid_at?: string | null
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
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_profile_id_fkey"
            columns: ["affiliate_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_profile_id_fkey"
            columns: ["affiliate_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
      content_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["content_block_type"]
          content: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          section_id: string
          sort_order: number | null
          styles: Json | null
          updated_at: string | null
        }
        Insert: {
          block_type: Database["public"]["Enums"]["content_block_type"]
          content?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          section_id: string
          sort_order?: number | null
          styles?: Json | null
          updated_at?: string | null
        }
        Update: {
          block_type?: Database["public"]["Enums"]["content_block_type"]
          content?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          section_id?: string
          sort_order?: number | null
          styles?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_content_blocks_section"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      content_editor_drafts: {
        Row: {
          created_at: string
          created_by: string
          draft_content: Json
          draft_metadata: Json
          draft_name: string
          id: string
          is_auto_save: boolean
          page_id: string
          scheduled_publish_at: string | null
          status: string
          updated_at: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          draft_content: Json
          draft_metadata?: Json
          draft_name: string
          id?: string
          is_auto_save?: boolean
          page_id: string
          scheduled_publish_at?: string | null
          status?: string
          updated_at?: string
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          draft_content?: Json
          draft_metadata?: Json
          draft_name?: string
          id?: string
          is_auto_save?: boolean
          page_id?: string
          scheduled_publish_at?: string | null
          status?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          is_global: boolean | null
          is_visible: boolean | null
          page_id: string | null
          section_name: string
          section_type: Database["public"]["Enums"]["content_type"] | null
          settings: Json | null
          sort_order: number | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          is_visible?: boolean | null
          page_id?: string | null
          section_name: string
          section_type?: Database["public"]["Enums"]["content_type"] | null
          settings?: Json | null
          sort_order?: number | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          is_visible?: boolean | null
          page_id?: string | null
          section_name?: string
          section_type?: Database["public"]["Enums"]["content_type"] | null
          settings?: Json | null
          sort_order?: number | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_content_sections_page"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "store_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_content_sections_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          discount_applied: number
          id: string
          order_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_applied: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_applied?: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          coupon_code: string
          coupon_name: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          shop_id: string | null
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          coupon_code: string
          coupon_name: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          shop_id?: string | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          coupon_code?: string
          coupon_name?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          shop_id?: string | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          created_at: string | null
          executed_at: string | null
          id: string
          job_name: string
          message: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          executed_at?: string | null
          id?: string
          job_name: string
          message?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          executed_at?: string | null
          id?: string
          job_name?: string
          message?: string | null
          status?: string
        }
        Relationships: []
      }
      custom_forms: {
        Row: {
          created_at: string | null
          fields: Json
          form_name: string
          form_title: string
          id: string
          is_active: boolean | null
          settings: Json | null
          store_id: string
          submit_url: string | null
          success_message: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fields?: Json
          form_name: string
          form_title: string
          id?: string
          is_active?: boolean | null
          settings?: Json | null
          store_id: string
          submit_url?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fields?: Json
          form_name?: string
          form_title?: string
          id?: string
          is_active?: boolean | null
          settings?: Json | null
          store_id?: string
          submit_url?: string | null
          success_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_custom_forms_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          additional_info: string | null
          address_type: string | null
          apartment_number: string | null
          building_number: string | null
          city: string
          country: string | null
          created_at: string
          customer_id: string
          district: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string | null
          postal_code: string | null
          street_address: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          address_type?: string | null
          apartment_number?: string | null
          building_number?: string | null
          city: string
          country?: string | null
          created_at?: string
          customer_id: string
          district?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string | null
          street_address: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          address_type?: string | null
          apartment_number?: string | null
          building_number?: string | null
          city?: string
          country?: string | null
          created_at?: string
          customer_id?: string
          district?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string | null
          street_address?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journey_steps: {
        Row: {
          affiliate_store_id: string | null
          created_at: string
          customer_id: string
          id: string
          step_category: string
          step_data: Json | null
          step_name: string
          store_id: string | null
          timestamp: string
        }
        Insert: {
          affiliate_store_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          step_category: string
          step_data?: Json | null
          step_name: string
          store_id?: string | null
          timestamp?: string
        }
        Update: {
          affiliate_store_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          step_category?: string
          step_data?: Json | null
          step_name?: string
          store_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      customer_loyalty: {
        Row: {
          created_at: string
          current_points: number
          current_tier_id: string | null
          customer_id: string
          id: string
          last_activity_at: string | null
          shop_id: string | null
          tier_progress: number | null
          total_earned_points: number
          total_spent_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_points?: number
          current_tier_id?: string | null
          customer_id: string
          id?: string
          last_activity_at?: string | null
          shop_id?: string | null
          tier_progress?: number | null
          total_earned_points?: number
          total_spent_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_points?: number
          current_tier_id?: string | null
          customer_id?: string
          id?: string
          last_activity_at?: string | null
          shop_id?: string | null
          tier_progress?: number | null
          total_earned_points?: number
          total_spent_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_loyalty_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_otp_sessions: {
        Row: {
          attempts: number | null
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          session_data: Json | null
          store_id: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          otp_code: string
          phone: string
          session_data?: Json | null
          store_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          session_data?: Json | null
          store_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_otp_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          affiliate_store_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_count: number | null
          id: string
          is_active: boolean
          name: string
          rules: Json
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_count?: number | null
          id?: string
          is_active?: boolean
          name: string
          rules?: Json
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_count?: number | null
          id?: string
          is_active?: boolean
          name?: string
          rules?: Json
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          date_of_birth: string | null
          gender: string | null
          id: string
          last_order_at: string | null
          loyalty_points: number | null
          marketing_consent: boolean | null
          notes: string | null
          preferred_language: string | null
          preferred_payment_method: string | null
          profile_id: string
          total_orders: number | null
          total_spent_sar: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          last_order_at?: string | null
          loyalty_points?: number | null
          marketing_consent?: boolean | null
          notes?: string | null
          preferred_language?: string | null
          preferred_payment_method?: string | null
          profile_id: string
          total_orders?: number | null
          total_spent_sar?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          last_order_at?: string | null
          loyalty_points?: number | null
          marketing_consent?: boolean | null
          notes?: string | null
          preferred_language?: string | null
          preferred_payment_method?: string | null
          profile_id?: string
          total_orders?: number | null
          total_spent_sar?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_coupon_usage: {
        Row: {
          coupon_id: string
          discount_applied_sar: number
          id: string
          order_id: string
          used_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          discount_applied_sar: number
          id?: string
          order_id: string
          used_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          discount_applied_sar?: number
          id?: string
          order_id?: string
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_order_items: {
        Row: {
          commission_rate: number | null
          commission_sar: number | null
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image_url: string | null
          product_sku: string | null
          product_title: string
          quantity: number
          selected_variants: Json | null
          total_price_sar: number | null
          unit_price_sar: number
        }
        Insert: {
          commission_rate?: number | null
          commission_sar?: number | null
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image_url?: string | null
          product_sku?: string | null
          product_title: string
          quantity: number
          selected_variants?: Json | null
          total_price_sar?: number | null
          unit_price_sar: number
        }
        Update: {
          commission_rate?: number | null
          commission_sar?: number | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image_url?: string | null
          product_sku?: string | null
          product_title?: string
          quantity?: number
          selected_variants?: Json | null
          total_price_sar?: number | null
          unit_price_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_orders: {
        Row: {
          affiliate_commission_sar: number | null
          affiliate_store_id: string | null
          buyer_session_id: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          coupon_code: string | null
          coupon_discount_sar: number | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          discount_sar: number
          estimated_delivery_date: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipped_at: string | null
          shipping_address: Json
          shipping_method: Database["public"]["Enums"]["shipping_method"]
          shipping_sar: number
          shop_id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_sar: number
          tax_sar: number
          total_sar: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          buyer_session_id?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          coupon_discount_sar?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          discount_sar?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address: Json
          shipping_method?: Database["public"]["Enums"]["shipping_method"]
          shipping_sar?: number
          shop_id: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar: number
          tax_sar?: number
          total_sar: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          buyer_session_id?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          coupon_code?: string | null
          coupon_discount_sar?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          discount_sar?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address?: Json
          shipping_method?: Database["public"]["Enums"]["shipping_method"]
          shipping_sar?: number
          shop_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar?: number
          tax_sar?: number
          total_sar?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecommerce_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_payment_transactions: {
        Row: {
          amount_sar: number
          completed_at: string | null
          created_at: string
          currency: string
          external_transaction_id: string | null
          failed_at: string | null
          failure_reason: string | null
          gateway_fee_sar: number | null
          gateway_name: string | null
          gateway_response: Json | null
          id: string
          initiated_at: string
          metadata: Json | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount_sar: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          gateway_fee_sar?: number | null
          gateway_name?: string | null
          gateway_response?: Json | null
          id?: string
          initiated_at?: string
          metadata?: Json | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount_sar?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          gateway_fee_sar?: number | null
          gateway_name?: string | null
          gateway_response?: Json | null
          id?: string
          initiated_at?: string
          metadata?: Json | null
          order_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounce_count: number | null
          campaign_name: string
          campaign_type: string
          clicked_count: number | null
          created_at: string
          delivered_count: number | null
          email_template: string
          id: string
          opened_count: number | null
          scheduled_at: string | null
          sender_email: string
          sender_name: string
          sent_at: string | null
          shop_id: string | null
          status: string
          subject_line: string
          target_audience: Json | null
          total_recipients: number | null
          unsubscribed_count: number | null
          updated_at: string
        }
        Insert: {
          bounce_count?: number | null
          campaign_name: string
          campaign_type?: string
          clicked_count?: number | null
          created_at?: string
          delivered_count?: number | null
          email_template: string
          id?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sender_email: string
          sender_name: string
          sent_at?: string | null
          shop_id?: string | null
          status?: string
          subject_line: string
          target_audience?: Json | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string
        }
        Update: {
          bounce_count?: number | null
          campaign_name?: string
          campaign_type?: string
          clicked_count?: number | null
          created_at?: string
          delivered_count?: number | null
          email_template?: string
          id?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sender_email?: string
          sender_name?: string
          sent_at?: string | null
          shop_id?: string | null
          status?: string
          subject_line?: string
          target_audience?: Json | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string
        }
        Relationships: []
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
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          ip_address: unknown | null
          submitted_at: string | null
          user_agent: string | null
        }
        Insert: {
          data: Json
          form_id: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string | null
          user_agent?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_form_submissions_form"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          metadata: Json | null
          order_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number
          rule_id: string | null
          status: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score: number
          rule_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          rule_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "fraud_detection_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          rule_name: string
          rule_type: string
          severity: string
          updated_at: string
        }
        Insert: {
          action: string
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_name: string
          rule_type: string
          severity?: string
          updated_at?: string
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          rule_name?: string
          rule_type?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      interactive_elements: {
        Row: {
          action_config: Json
          animation_config: Json
          conditions: Json
          created_at: string
          element_id: string
          id: string
          interaction_type: string
          is_enabled: boolean
          trigger_event: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          animation_config?: Json
          conditions?: Json
          created_at?: string
          element_id: string
          id?: string
          interaction_type: string
          is_enabled?: boolean
          trigger_event?: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          animation_config?: Json
          conditions?: Json
          created_at?: string
          element_id?: string
          id?: string
          interaction_type?: string
          is_enabled?: boolean
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_alerts: {
        Row: {
          alert_type: string
          created_at: string
          created_for_role: string[] | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          product_variant_id: string | null
          read_at: string | null
          return_id: string | null
          title: string
          warehouse_product_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          created_for_role?: string[] | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          product_variant_id?: string | null
          read_at?: string | null
          return_id?: string | null
          title: string
          warehouse_product_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          created_for_role?: string[] | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          product_variant_id?: string | null
          read_at?: string | null
          return_id?: string | null
          title?: string
          warehouse_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "product_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_alerts_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          last_counted_at: string | null
          location: string | null
          max_stock_level: number | null
          product_variant_id: string | null
          quantity_available: number | null
          quantity_on_order: number | null
          quantity_reserved: number | null
          reorder_level: number | null
          sku: string
          unit_cost: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          max_stock_level?: number | null
          product_variant_id?: string | null
          quantity_available?: number | null
          quantity_on_order?: number | null
          quantity_reserved?: number | null
          reorder_level?: number | null
          sku: string
          unit_cost?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          max_stock_level?: number | null
          product_variant_id?: string | null
          quantity_available?: number | null
          quantity_on_order?: number | null
          quantity_reserved?: number | null
          reorder_level?: number | null
          sku?: string
          unit_cost?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          movement_number: string
          movement_type: string
          notes: string | null
          product_variant_id: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          supplier_id: string | null
          total_cost: number | null
          unit_cost: number | null
          warehouse_product_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          movement_number: string
          movement_type: string
          notes?: string | null
          product_variant_id?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_product_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          movement_number?: string
          movement_type?: string
          notes?: string | null
          product_variant_id?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          inventory_item_id: string | null
          notes: string | null
          quantity_reserved: number
          reservation_type: string | null
          reserved_for: string
          status: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity_reserved: number
          reservation_type?: string | null
          reserved_for: string
          status?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity_reserved?: number
          reservation_type?: string | null
          reserved_for?: string
          status?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          discount_sar: number
          id: string
          invoice_id: string
          item_description: string | null
          item_name: string
          item_sku: string | null
          product_id: string | null
          quantity: number
          subtotal_sar: number
          total_sar: number
          unit_price_sar: number
          vat_rate: number
          vat_sar: number
        }
        Insert: {
          created_at?: string
          discount_sar?: number
          id?: string
          invoice_id: string
          item_description?: string | null
          item_name: string
          item_sku?: string | null
          product_id?: string | null
          quantity?: number
          subtotal_sar: number
          total_sar: number
          unit_price_sar: number
          vat_rate?: number
          vat_sar: number
        }
        Update: {
          created_at?: string
          discount_sar?: number
          id?: string
          invoice_id?: string
          item_description?: string | null
          item_name?: string
          item_sku?: string | null
          product_id?: string | null
          quantity?: number
          subtotal_sar?: number
          total_sar?: number
          unit_price_sar?: number
          vat_rate?: number
          vat_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_address: Json
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_profile_id: string | null
          discount_sar: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          metadata: Json | null
          notes: string | null
          order_id: string | null
          paid_at: string | null
          payment_status: string
          shipping_sar: number
          shop_id: string | null
          status: string
          subtotal_sar: number
          tax_registration_number: string | null
          total_sar: number
          updated_at: string
          vat_breakdown: Json | null
          vat_rate: number
          vat_sar: number
        }
        Insert: {
          created_at?: string
          customer_address: Json
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_profile_id?: string | null
          discount_sar?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_status?: string
          shipping_sar?: number
          shop_id?: string | null
          status?: string
          subtotal_sar?: number
          tax_registration_number?: string | null
          total_sar?: number
          updated_at?: string
          vat_breakdown?: Json | null
          vat_rate?: number
          vat_sar?: number
        }
        Update: {
          created_at?: string
          customer_address?: Json
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_profile_id?: string | null
          discount_sar?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_status?: string
          shipping_sar?: number
          shop_id?: string | null
          status?: string
          subtotal_sar?: number
          tax_registration_number?: string | null
          total_sar?: number
          updated_at?: string
          vat_breakdown?: Json | null
          vat_rate?: number
          vat_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_data: Json | null
          activity_description: string
          activity_type: string
          created_at: string
          id: string
          lead_id: string
          performed_by: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_description: string
          activity_type: string
          created_at?: string
          id?: string
          lead_id: string
          performed_by?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_description?: string
          activity_type?: string
          created_at?: string
          id?: string
          lead_id?: string
          performed_by?: string | null
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
          {
            foreignKeyName: "leaderboard_weekly_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          affiliate_store_id: string | null
          assigned_to: string | null
          company: string | null
          conversion_date: string | null
          conversion_value: number | null
          created_at: string
          custom_fields: Json | null
          email: string
          full_name: string | null
          id: string
          interest_level: string | null
          last_activity_at: string | null
          lead_score: number | null
          lead_source: string
          lead_status: string
          notes: string | null
          phone: string | null
          store_id: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          affiliate_store_id?: string | null
          assigned_to?: string | null
          company?: string | null
          conversion_date?: string | null
          conversion_value?: number | null
          created_at?: string
          custom_fields?: Json | null
          email: string
          full_name?: string | null
          id?: string
          interest_level?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source: string
          lead_status?: string
          notes?: string | null
          phone?: string | null
          store_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliate_store_id?: string | null
          assigned_to?: string | null
          company?: string | null
          conversion_date?: string | null
          conversion_value?: number | null
          created_at?: string
          custom_fields?: Json | null
          email?: string
          full_name?: string | null
          id?: string
          interest_level?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_source?: string
          lead_status?: string
          notes?: string | null
          phone?: string | null
          store_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          created_at: string
          customer_loyalty_id: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          points_used: number
          redemption_code: string | null
          reward_id: string | null
          status: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          customer_loyalty_id?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_used: number
          redemption_code?: string | null
          reward_id?: string | null
          status?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          customer_loyalty_id?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_used?: number
          redemption_code?: string | null
          reward_id?: string | null
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_customer_loyalty_id_fkey"
            columns: ["customer_loyalty_id"]
            isOneToOne: false
            referencedRelation: "customer_loyalty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          minimum_tier_required: string | null
          points_required: number
          reward_description: string | null
          reward_name: string
          reward_type: string
          reward_value: number
          shop_id: string | null
          stock_quantity: number | null
          updated_at: string
          used_quantity: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_tier_required?: string | null
          points_required: number
          reward_description?: string | null
          reward_name: string
          reward_type: string
          reward_value: number
          shop_id?: string | null
          stock_quantity?: number | null
          updated_at?: string
          used_quantity?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_tier_required?: string | null
          points_required?: number
          reward_description?: string | null
          reward_name?: string
          reward_type?: string
          reward_value?: number
          shop_id?: string | null
          stock_quantity?: number | null
          updated_at?: string
          used_quantity?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_minimum_tier_required_fkey"
            columns: ["minimum_tier_required"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          benefits: Json | null
          created_at: string
          id: string
          is_active: boolean
          minimum_points: number
          minimum_spent_amount: number | null
          shop_id: string | null
          tier_color: string | null
          tier_description: string | null
          tier_icon: string | null
          tier_name: string
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_points?: number
          minimum_spent_amount?: number | null
          shop_id?: string | null
          tier_color?: string | null
          tier_description?: string | null
          tier_icon?: string | null
          tier_name: string
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_points?: number
          minimum_spent_amount?: number | null
          shop_id?: string | null
          tier_color?: string | null
          tier_description?: string | null
          tier_icon?: string | null
          tier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_loyalty_id: string | null
          description: string | null
          expiry_date: string | null
          id: string
          order_id: string | null
          points_amount: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          customer_loyalty_id?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          order_id?: string | null
          points_amount: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          customer_loyalty_id?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          order_id?: string | null
          points_amount?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_loyalty_id_fkey"
            columns: ["customer_loyalty_id"]
            isOneToOne: false
            referencedRelation: "customer_loyalty"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_automation_campaigns: {
        Row: {
          affiliate_store_id: string | null
          campaign_steps: Json
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          stats: Json | null
          store_id: string | null
          target_audience_rules: Json
          trigger_conditions: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          affiliate_store_id?: string | null
          campaign_steps?: Json
          campaign_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          stats?: Json | null
          store_id?: string | null
          target_audience_rules?: Json
          trigger_conditions?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          affiliate_store_id?: string | null
          campaign_steps?: Json
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          stats?: Json | null
          store_id?: string | null
          target_audience_rules?: Json
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          folder_path: string | null
          id: string
          store_id: string
          tags: string[] | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          folder_path?: string | null
          id?: string
          store_id: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder_path?: string | null
          id?: string
          store_id?: string
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_media_library_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
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
          {
            foreignKeyName: "merchants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
            foreignKeyName: "messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          migrated_items: number | null
          migration_type: string
          status: string
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          migrated_items?: number | null
          migration_type: string
          status?: string
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          migrated_items?: number | null
          migration_type?: string
          status?: string
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_leaderboard: {
        Row: {
          created_at: string
          customers_count: number
          id: string
          month_number: number
          orders_count: number
          points: number
          rank: number | null
          rank_change: number | null
          rewards_earned: Json | null
          sales_amount: number
          updated_at: string
          user_id: string
          year_number: number
        }
        Insert: {
          created_at?: string
          customers_count?: number
          id?: string
          month_number: number
          orders_count?: number
          points?: number
          rank?: number | null
          rank_change?: number | null
          rewards_earned?: Json | null
          sales_amount?: number
          updated_at?: string
          user_id: string
          year_number: number
        }
        Update: {
          created_at?: string
          customers_count?: number
          id?: string
          month_number?: number
          orders_count?: number
          points?: number
          rank?: number | null
          rank_change?: number | null
          rewards_earned?: Json | null
          sales_amount?: number
          updated_at?: string
          user_id?: string
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          commission_rate: number
          created_at: string | null
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
          commission_rate?: number
          created_at?: string | null
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
          commission_rate?: number
          created_at?: string | null
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
      order_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          affiliate_profile_id: string | null
          affiliate_store_id: string | null
          commission_amount_sar: number
          commission_rate: number
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          session_id: string
          status: string
          unit_price_sar: number
          updated_at: string
        }
        Insert: {
          affiliate_profile_id?: string | null
          affiliate_store_id?: string | null
          commission_amount_sar: number
          commission_rate?: number
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id: string
          status?: string
          unit_price_sar: number
          updated_at?: string
        }
        Update: {
          affiliate_profile_id?: string | null
          affiliate_store_id?: string | null
          commission_amount_sar?: number
          commission_rate?: number
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          session_id?: string
          status?: string
          unit_price_sar?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_affiliate_profile_id_fkey"
            columns: ["affiliate_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_affiliate_profile_id_fkey"
            columns: ["affiliate_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_tracking_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          affiliate_commission_sar: number | null
          affiliate_store_id: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          customer_profile_id: string | null
          delivered_at: string | null
          id: string
          order_number: string | null
          payment_method: string
          shipping_address: Json
          shipping_sar: number | null
          shop_id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_sar: number
          tax_sar: number | null
          total_sar: number
          tracking_number: string | null
          updated_at: string
          vat_sar: number
        }
        Insert: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          customer_profile_id?: string | null
          delivered_at?: string | null
          id?: string
          order_number?: string | null
          payment_method: string
          shipping_address: Json
          shipping_sar?: number | null
          shop_id: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar?: number
          tax_sar?: number | null
          total_sar?: number
          tracking_number?: string | null
          updated_at?: string
          vat_sar?: number
        }
        Update: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          customer_profile_id?: string | null
          delivered_at?: string | null
          id?: string
          order_number?: string | null
          payment_method?: string
          shipping_address?: Json
          shipping_sar?: number | null
          shop_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_sar?: number
          tax_sar?: number | null
          total_sar?: number
          tracking_number?: string | null
          updated_at?: string
          vat_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      page_builder_elements: {
        Row: {
          created_at: string
          element_config: Json
          element_data: Json
          element_name: string
          element_styles: Json
          element_type: string
          grid_column: number | null
          grid_row: number | null
          grid_span_x: number | null
          grid_span_y: number | null
          id: string
          is_locked: boolean
          is_visible: boolean
          page_id: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          element_config?: Json
          element_data?: Json
          element_name: string
          element_styles?: Json
          element_type: string
          grid_column?: number | null
          grid_row?: number | null
          grid_span_x?: number | null
          grid_span_y?: number | null
          id?: string
          is_locked?: boolean
          is_visible?: boolean
          page_id: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          element_config?: Json
          element_data?: Json
          element_name?: string
          element_styles?: Json
          element_type?: string
          grid_column?: number | null
          grid_row?: number | null
          grid_span_x?: number | null
          grid_span_y?: number | null
          id?: string
          is_locked?: boolean
          is_visible?: boolean
          page_id?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_builder_sessions: {
        Row: {
          auto_save_data: Json
          browser_info: Json | null
          created_at: string
          id: string
          is_active: boolean
          last_activity: string
          page_id: string
          session_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save_data?: Json
          browser_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          page_id: string
          session_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save_data?: Json
          browser_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          page_id?: string
          session_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_system_template: boolean | null
          name: string
          preview_image_url: string | null
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name: string
          preview_image_url?: string | null
          template_data?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          allowed_currencies: string[] | null
          api_key: string | null
          api_url: string | null
          configuration: Json | null
          created_at: string
          display_name: string
          fixed_fee_sar: number | null
          gateway_name: string
          id: string
          is_enabled: boolean
          is_test_mode: boolean
          max_amount_sar: number | null
          merchant_id: string | null
          min_amount_sar: number | null
          percentage_fee: number | null
          provider: string
          secret_key: string | null
          shop_id: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          allowed_currencies?: string[] | null
          api_key?: string | null
          api_url?: string | null
          configuration?: Json | null
          created_at?: string
          display_name: string
          fixed_fee_sar?: number | null
          gateway_name: string
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          max_amount_sar?: number | null
          merchant_id?: string | null
          min_amount_sar?: number | null
          percentage_fee?: number | null
          provider: string
          secret_key?: string | null
          shop_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          allowed_currencies?: string[] | null
          api_key?: string | null
          api_url?: string | null
          configuration?: Json | null
          created_at?: string
          display_name?: string
          fixed_fee_sar?: number | null
          gateway_name?: string
          id?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          max_amount_sar?: number | null
          merchant_id?: string | null
          min_amount_sar?: number | null
          percentage_fee?: number | null
          provider?: string
          secret_key?: string | null
          shop_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateways_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_sar: number
          completed_at: string | null
          created_at: string
          currency: string
          failed_at: string | null
          failure_reason: string | null
          gateway_fee_sar: number | null
          gateway_id: string | null
          gateway_reference: string | null
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          initiated_at: string
          invoice_id: string | null
          metadata: Json | null
          net_amount_sar: number
          order_id: string | null
          payment_id: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount_sar: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          gateway_fee_sar?: number | null
          gateway_id?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          initiated_at?: string
          invoice_id?: string | null
          metadata?: Json | null
          net_amount_sar: number
          order_id?: string | null
          payment_id?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount_sar?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          gateway_fee_sar?: number | null
          gateway_id?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          initiated_at?: string
          invoice_id?: string | null
          metadata?: Json | null
          net_amount_sar?: number
          order_id?: string | null
          payment_id?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
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
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "points_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_insights: {
        Row: {
          affiliate_store_id: string | null
          confidence_score: number | null
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          prediction_period: string | null
          store_id: string | null
          valid_until: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          confidence_score?: number | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type: string
          prediction_period?: string | null
          store_id?: string | null
          valid_until?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          confidence_score?: number | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          prediction_period?: string | null
          store_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      product_activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          product_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          product_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          product_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_activity_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          attribute_name: string
          attribute_type: string | null
          attribute_value: string
          created_at: string
          id: string
          is_variant: boolean | null
          product_id: string
        }
        Insert: {
          attribute_name: string
          attribute_type?: string | null
          attribute_value: string
          created_at?: string
          id?: string
          is_variant?: boolean | null
          product_id: string
        }
        Update: {
          attribute_name?: string
          attribute_type?: string | null
          attribute_value?: string
          created_at?: string
          id?: string
          is_variant?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          name_ar: string | null
          name_en: string | null
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          name_ar?: string | null
          name_en?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          name_ar?: string | null
          name_en?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_discounts: {
        Row: {
          created_at: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          product_id: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_discounts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          dimensions: Json | null
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          product_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          product_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          product_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_type: string
          resource_id: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type: string
          resource_id?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_type?: string
          resource_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_returns: {
        Row: {
          affiliate_id: string | null
          commission_deducted: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          order_number: string
          processed_by: string
          return_date: string
          return_number: string
          return_reason: string | null
          return_type: string
          status: string
          total_returned_amount: number
        }
        Insert: {
          affiliate_id?: string | null
          commission_deducted?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          order_number: string
          processed_by: string
          return_date?: string
          return_number: string
          return_reason?: string | null
          return_type: string
          status?: string
          total_returned_amount?: number
        }
        Update: {
          affiliate_id?: string | null
          commission_deducted?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          order_number?: string
          processed_by?: string
          return_date?: string
          return_number?: string
          return_reason?: string | null
          return_type?: string
          status?: string
          total_returned_amount?: number
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: Json | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_hidden: boolean
          is_verified: boolean
          order_id: string | null
          product_id: string
          rating: number
          store_response: string | null
          store_response_at: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean
          is_verified?: boolean
          order_id?: string | null
          product_id: string
          rating: number
          store_response?: string | null
          store_response_at?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean
          is_verified?: boolean
          order_id?: string | null
          product_id?: string
          rating?: number
          store_response?: string | null
          store_response_at?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_seo: {
        Row: {
          created_at: string | null
          id: string
          meta_keywords: string[] | null
          product_id: string
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta_keywords?: string[] | null
          product_id: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta_keywords?: string[] | null
          product_id?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_seo_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_shipping: {
        Row: {
          created_at: string | null
          handling_time_days: number | null
          height_cm: number | null
          id: string
          length_cm: number | null
          origin_country: string | null
          product_id: string
          return_policy: string | null
          updated_at: string | null
          warehouse_id: string | null
          weight_grams: number | null
          width_cm: number | null
        }
        Insert: {
          created_at?: string | null
          handling_time_days?: number | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          origin_country?: string | null
          product_id: string
          return_policy?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Update: {
          created_at?: string | null
          handling_time_days?: number | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          origin_country?: string | null
          product_id?: string
          return_policy?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_shipping_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_options: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          sort_order: number | null
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          sort_order?: number | null
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          sort_order?: number | null
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          available_stock: number | null
          color: string | null
          cost_price: number | null
          created_at: string
          current_stock: number
          id: string
          image_urls: Json | null
          is_active: boolean
          material: string | null
          min_stock_level: number | null
          other_attributes: Json | null
          product_id: string | null
          reserved_stock: number
          selling_price: number | null
          size: string | null
          updated_at: string
          variant_barcode: string | null
          variant_name: string
          variant_sku: string | null
          warehouse_product_id: string | null
        }
        Insert: {
          available_stock?: number | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          image_urls?: Json | null
          is_active?: boolean
          material?: string | null
          min_stock_level?: number | null
          other_attributes?: Json | null
          product_id?: string | null
          reserved_stock?: number
          selling_price?: number | null
          size?: string | null
          updated_at?: string
          variant_barcode?: string | null
          variant_name: string
          variant_sku?: string | null
          warehouse_product_id?: string | null
        }
        Update: {
          available_stock?: number | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          id?: string
          image_urls?: Json | null
          is_active?: boolean
          material?: string | null
          min_stock_level?: number | null
          other_attributes?: Json | null
          product_id?: string | null
          reserved_stock?: number
          selling_price?: number | null
          size?: string | null
          updated_at?: string
          variant_barcode?: string | null
          variant_name?: string
          variant_sku?: string | null
          warehouse_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: false
            referencedRelation: "warehouse_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants_advanced: {
        Row: {
          barcode: string | null
          color: string | null
          color_code: string | null
          color_swatch_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          min_stock_alert: number | null
          price_override: number | null
          product_id: string
          quantity: number
          size: string | null
          sku: string
          updated_at: string | null
          variant_image_url: string | null
        }
        Insert: {
          barcode?: string | null
          color?: string | null
          color_code?: string | null
          color_swatch_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_alert?: number | null
          price_override?: number | null
          product_id: string
          quantity?: number
          size?: string | null
          sku: string
          updated_at?: string | null
          variant_image_url?: string | null
        }
        Update: {
          barcode?: string | null
          color?: string | null
          color_code?: string | null
          color_swatch_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_stock_alert?: number | null
          price_override?: number | null
          product_id?: string
          quantity?: number
          size?: string | null
          sku?: string
          updated_at?: string | null
          variant_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_advanced_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          approval_notes: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          attributes_schema: Json | null
          brand_id: string | null
          category: string | null
          category_id: string | null
          commission_rate: number | null
          created_at: string
          description: string | null
          dimensions_cm: string | null
          external_id: string | null
          featured: boolean | null
          id: string
          image_urls: string[] | null
          images: Json | null
          is_active: boolean
          last_viewed_at: string | null
          max_order_quantity: number | null
          merchant_id: string
          meta_keywords: string[] | null
          min_order_quantity: number | null
          price_sar: number
          rejected_at: string | null
          sales_count: number | null
          seo_description: string | null
          seo_title: string | null
          shop_id: string | null
          sku: string | null
          stock: number
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
          weight_kg: number | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attributes_schema?: Json | null
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          dimensions_cm?: string | null
          external_id?: string | null
          featured?: boolean | null
          id?: string
          image_urls?: string[] | null
          images?: Json | null
          is_active?: boolean
          last_viewed_at?: string | null
          max_order_quantity?: number | null
          merchant_id: string
          meta_keywords?: string[] | null
          min_order_quantity?: number | null
          price_sar: number
          rejected_at?: string | null
          sales_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shop_id?: string | null
          sku?: string | null
          stock?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
          weight_kg?: number | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attributes_schema?: Json | null
          brand_id?: string | null
          category?: string | null
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          dimensions_cm?: string | null
          external_id?: string | null
          featured?: boolean | null
          id?: string
          image_urls?: string[] | null
          images?: Json | null
          is_active?: boolean
          last_viewed_at?: string | null
          max_order_quantity?: number | null
          merchant_id?: string
          meta_keywords?: string[] | null
          min_order_quantity?: number | null
          price_sar?: number
          rejected_at?: string | null
          sales_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shop_id?: string | null
          sku?: string | null
          stock?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
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
          current_level: Database["public"]["Enums"]["user_level"] | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_activity_at: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          level_achieved_at: string | null
          level_points: number | null
          next_level_threshold: number | null
          phone: string | null
          points: number
          role: Database["public"]["Enums"]["user_role"]
          total_earnings: number | null
          total_points: number | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_shops_count?: number | null
          current_level?: Database["public"]["Enums"]["user_level"] | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          level_achieved_at?: string | null
          level_points?: number | null
          next_level_threshold?: number | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
          total_points?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          created_shops_count?: number | null
          current_level?: Database["public"]["Enums"]["user_level"] | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          level_achieved_at?: string | null
          level_points?: number | null
          next_level_threshold?: number | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
          total_points?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      promotion_campaigns: {
        Row: {
          affiliate_store_id: string | null
          applicable_categories: Json | null
          applicable_products: Json | null
          auto_apply: boolean | null
          campaign_name: string
          campaign_name_ar: string | null
          campaign_type: string
          created_at: string | null
          created_by: string | null
          current_usage_count: number | null
          description: string | null
          description_ar: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string
          excluded_products: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          start_date: string
          store_id: string | null
          timezone: string | null
          updated_at: string | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
        }
        Insert: {
          affiliate_store_id?: string | null
          applicable_categories?: Json | null
          applicable_products?: Json | null
          auto_apply?: boolean | null
          campaign_name: string
          campaign_name_ar?: string | null
          campaign_type?: string
          created_at?: string | null
          created_by?: string | null
          current_usage_count?: number | null
          description?: string | null
          description_ar?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date: string
          excluded_products?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          start_date: string
          store_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
        }
        Update: {
          affiliate_store_id?: string | null
          applicable_categories?: Json | null
          applicable_products?: Json | null
          auto_apply?: boolean | null
          campaign_name?: string
          campaign_name_ar?: string | null
          campaign_type?: string
          created_at?: string | null
          created_by?: string | null
          current_usage_count?: number | null
          description?: string | null
          description_ar?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string
          excluded_products?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          start_date?: string
          store_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          affiliate_store_id: string | null
          animation_type: string | null
          auto_hide_after_interaction: boolean | null
          background_color: string | null
          banner_type: string
          button_color: string | null
          button_text: string | null
          button_text_ar: string | null
          button_url: string | null
          content_config: Json | null
          created_at: string | null
          created_by: string | null
          current_clicks: number | null
          current_impressions: number | null
          description: string | null
          description_ar: string | null
          display_conditions: Json | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_clicks: number | null
          max_impressions: number | null
          position: string
          priority: number | null
          show_close_button: boolean | null
          start_date: string | null
          store_id: string | null
          target_audience: Json | null
          text_color: string | null
          timezone: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          animation_type?: string | null
          auto_hide_after_interaction?: boolean | null
          background_color?: string | null
          banner_type?: string
          button_color?: string | null
          button_text?: string | null
          button_text_ar?: string | null
          button_url?: string | null
          content_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          description?: string | null
          description_ar?: string | null
          display_conditions?: Json | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_clicks?: number | null
          max_impressions?: number | null
          position?: string
          priority?: number | null
          show_close_button?: boolean | null
          start_date?: string | null
          store_id?: string | null
          target_audience?: Json | null
          text_color?: string | null
          timezone?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          animation_type?: string | null
          auto_hide_after_interaction?: boolean | null
          background_color?: string | null
          banner_type?: string
          button_color?: string | null
          button_text?: string | null
          button_text_ar?: string | null
          button_url?: string | null
          content_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          description?: string | null
          description_ar?: string | null
          display_conditions?: Json | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_clicks?: number | null
          max_impressions?: number | null
          position?: string
          priority?: number | null
          show_close_button?: boolean | null
          start_date?: string | null
          store_id?: string | null
          target_audience?: Json | null
          text_color?: string | null
          timezone?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_items: {
        Row: {
          condition_on_return: string | null
          created_at: string
          id: string
          order_item_id: string
          quantity_returned: number
          refund_id: string
          return_reason: string | null
          total_refund_sar: number
          unit_price_sar: number
        }
        Insert: {
          condition_on_return?: string | null
          created_at?: string
          id?: string
          order_item_id: string
          quantity_returned: number
          refund_id: string
          return_reason?: string | null
          total_refund_sar: number
          unit_price_sar: number
        }
        Update: {
          condition_on_return?: string | null
          created_at?: string
          id?: string
          order_item_id?: string
          quantity_returned?: number
          refund_id?: string
          return_reason?: string | null
          total_refund_sar?: number
          unit_price_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "refund_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_items_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          customer_notes: string | null
          description: string | null
          gateway_refund_id: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          net_refund_sar: number
          order_id: string
          original_amount_sar: number
          payment_id: string | null
          processed_at: string | null
          reason: string
          refund_amount_sar: number
          refund_fee_sar: number | null
          refund_method: string | null
          refund_number: string
          refund_type: string
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          description?: string | null
          gateway_refund_id?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          net_refund_sar: number
          order_id: string
          original_amount_sar: number
          payment_id?: string | null
          processed_at?: string | null
          reason: string
          refund_amount_sar: number
          refund_fee_sar?: number | null
          refund_method?: string | null
          refund_number: string
          refund_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          description?: string | null
          gateway_refund_id?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          net_refund_sar?: number
          order_id?: string
          original_amount_sar?: number
          payment_id?: string | null
          processed_at?: string | null
          reason?: string
          refund_amount_sar?: number
          refund_fee_sar?: number | null
          refund_method?: string | null
          refund_number?: string
          refund_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          id: string
          product_name: string
          product_variant_id: string
          quantity_returned: number
          return_id: string
          total_price: number
          unit_price: number
          variant_name: string
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          product_name: string
          product_variant_id: string
          quantity_returned: number
          return_id: string
          total_price: number
          unit_price: number
          variant_name: string
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          product_name?: string
          product_variant_id?: string
          quantity_returned?: number
          return_id?: string
          total_price?: number
          unit_price?: number
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "product_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          voter_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          voter_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          voter_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_voter_profile_id_fkey"
            columns: ["voter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_voter_profile_id_fkey"
            columns: ["voter_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          is_banned: boolean
          is_muted: boolean
          joined_at: string
          muted_until: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          joined_at?: string
          muted_until?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_banned?: boolean
          is_muted?: boolean
          joined_at?: string
          muted_until?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_page_components: {
        Row: {
          affiliate_store_id: string | null
          component_category: string
          component_data: Json
          component_description: string | null
          component_name: string
          component_preview: Json
          created_at: string
          created_by: string | null
          id: string
          is_public: boolean
          store_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          affiliate_store_id?: string | null
          component_category?: string
          component_data: Json
          component_description?: string | null
          component_name: string
          component_preview?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          store_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          affiliate_store_id?: string | null
          component_category?: string
          component_data?: Json
          component_description?: string | null
          component_name?: string
          component_preview?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean
          store_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      seasonal_campaigns: {
        Row: {
          banner_config: Json | null
          campaign_id: string | null
          created_at: string | null
          id: string
          season_type: string
          special_features: Json | null
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          banner_config?: Json | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          season_type: string
          special_features?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          banner_config?: Json | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          season_type?: string
          special_features?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_transactions: {
        Row: {
          audit_trail: Json | null
          created_at: string
          encrypted_data: string
          encryption_key_id: string
          expires_at: string
          hash_signature: string
          id: string
          order_id: string
          pci_compliance_level: string
          security_tokens: Json | null
        }
        Insert: {
          audit_trail?: Json | null
          created_at?: string
          encrypted_data: string
          encryption_key_id: string
          expires_at?: string
          hash_signature: string
          id?: string
          order_id: string
          pci_compliance_level?: string
          security_tokens?: Json | null
        }
        Update: {
          audit_trail?: Json | null
          created_at?: string
          encrypted_data?: string
          encryption_key_id?: string
          expires_at?: string
          hash_signature?: string
          id?: string
          order_id?: string
          pci_compliance_level?: string
          security_tokens?: Json | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_performed: string
          compliance_flags: Json | null
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_accessed: string | null
          risk_assessment: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_performed: string
          compliance_flags?: Json | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_accessed?: string | null
          risk_assessment?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_performed?: string
          compliance_flags?: Json | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_accessed?: string | null
          risk_assessment?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_login_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          reason: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          setting_name: string
          setting_value: Json
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          setting_name: string
          setting_value: Json
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          setting_name?: string
          setting_value?: Json
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          coordinates: Json | null
          created_at: string
          event_description: string
          event_timestamp: string
          event_type: string
          id: string
          location: string | null
          metadata: Json | null
          shipment_id: string
          source: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          event_description: string
          event_timestamp?: string
          event_type: string
          id?: string
          location?: string | null
          metadata?: Json | null
          shipment_id: string
          source?: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          event_description?: string
          event_timestamp?: string
          event_type?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          shipment_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_tracking: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          occurred_at: string
          provider_data: Json | null
          shipment_id: string
          status: string
          status_description: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          occurred_at: string
          provider_data?: Json | null
          shipment_id: string
          status: string
          status_description?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          provider_data?: Json | null
          shipment_id?: string
          status?: string
          status_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          cash_on_delivery: number | null
          cod_fee: number | null
          created_at: string | null
          current_location: string | null
          declared_value: number | null
          dimensions: Json | null
          estimated_delivery: string | null
          external_tracking_id: string | null
          id: string
          insurance_cost: number | null
          metadata: Json | null
          order_id: string | null
          provider_id: string
          recipient_address: Json
          recipient_name: string
          recipient_phone: string
          sender_address: Json
          sender_name: string
          sender_phone: string
          service_type: string
          shipment_number: string
          shipping_cost: number
          shop_id: string | null
          special_instructions: string | null
          status: string
          total_cost: number
          tracking_number: string | null
          updated_at: string | null
          weight_kg: number
        }
        Insert: {
          actual_delivery_date?: string | null
          cash_on_delivery?: number | null
          cod_fee?: number | null
          created_at?: string | null
          current_location?: string | null
          declared_value?: number | null
          dimensions?: Json | null
          estimated_delivery?: string | null
          external_tracking_id?: string | null
          id?: string
          insurance_cost?: number | null
          metadata?: Json | null
          order_id?: string | null
          provider_id: string
          recipient_address: Json
          recipient_name: string
          recipient_phone: string
          sender_address: Json
          sender_name: string
          sender_phone: string
          service_type: string
          shipment_number: string
          shipping_cost: number
          shop_id?: string | null
          special_instructions?: string | null
          status?: string
          total_cost: number
          tracking_number?: string | null
          updated_at?: string | null
          weight_kg: number
        }
        Update: {
          actual_delivery_date?: string | null
          cash_on_delivery?: number | null
          cod_fee?: number | null
          created_at?: string | null
          current_location?: string | null
          declared_value?: number | null
          dimensions?: Json | null
          estimated_delivery?: string | null
          external_tracking_id?: string | null
          id?: string
          insurance_cost?: number | null
          metadata?: Json | null
          order_id?: string | null
          provider_id?: string
          recipient_address?: Json
          recipient_name?: string
          recipient_phone?: string
          sender_address?: Json
          sender_name?: string
          sender_phone?: string
          service_type?: string
          shipment_number?: string
          shipping_cost?: number
          shop_id?: string | null
          special_instructions?: string | null
          status?: string
          total_cost?: number
          tracking_number?: string | null
          updated_at?: string | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "shipping_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_tracking: {
        Row: {
          actual_delivery_date: string | null
          cod_amount_sar: number | null
          created_at: string
          current_location: string | null
          current_status: string
          customer_name: string
          customer_phone: string
          delivery_address: Json
          dimensions: Json | null
          estimated_delivery_date: string | null
          id: string
          insurance_amount_sar: number | null
          notes: string | null
          order_id: string
          pickup_address: Json
          shipment_number: string
          shipping_cost_sar: number
          shipping_provider_id: string | null
          special_instructions: string | null
          tracking_number: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          actual_delivery_date?: string | null
          cod_amount_sar?: number | null
          created_at?: string
          current_location?: string | null
          current_status?: string
          customer_name: string
          customer_phone: string
          delivery_address: Json
          dimensions?: Json | null
          estimated_delivery_date?: string | null
          id?: string
          insurance_amount_sar?: number | null
          notes?: string | null
          order_id: string
          pickup_address: Json
          shipment_number: string
          shipping_cost_sar?: number
          shipping_provider_id?: string | null
          special_instructions?: string | null
          tracking_number?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          actual_delivery_date?: string | null
          cod_amount_sar?: number | null
          created_at?: string
          current_location?: string | null
          current_status?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: Json
          dimensions?: Json | null
          estimated_delivery_date?: string | null
          id?: string
          insurance_amount_sar?: number | null
          notes?: string | null
          order_id?: string
          pickup_address?: Json
          shipment_number?: string
          shipping_cost_sar?: number
          shipping_provider_id?: string | null
          special_instructions?: string | null
          tracking_number?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_tracking_shipping_provider_id_fkey"
            columns: ["shipping_provider_id"]
            isOneToOne: false
            referencedRelation: "shipping_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_providers: {
        Row: {
          api_endpoint: string | null
          code: string
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          name_en: string
          supported_services: Json | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          code: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          name_en: string
          supported_services?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          code?: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          name_en?: string
          supported_services?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          base_price: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_price: number | null
          min_price: number | null
          price_per_kg: number | null
          provider_id: string
          service_type: string
          weight_from: number | null
          weight_to: number | null
          zone_id: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          price_per_kg?: number | null
          provider_id: string
          service_type: string
          weight_from?: number | null
          weight_to?: number | null
          zone_id: string
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          price_per_kg?: number | null
          provider_id?: string
          service_type?: string
          weight_from?: number | null
          weight_to?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rates_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "shipping_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_rates_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string | null
          delivery_days_max: number | null
          delivery_days_min: number | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string
          parent_zone_id: string | null
          postal_codes: string[] | null
          zone_code: string
          zone_type: string
        }
        Insert: {
          created_at?: string | null
          delivery_days_max?: number | null
          delivery_days_min?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en: string
          parent_zone_id?: string | null
          postal_codes?: string[] | null
          zone_code: string
          zone_type: string
        }
        Update: {
          created_at?: string | null
          delivery_days_max?: number | null
          delivery_days_min?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string
          parent_zone_id?: string | null
          postal_codes?: string[] | null
          zone_code?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zones_parent_zone_id_fkey"
            columns: ["parent_zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
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
      shopping_carts: {
        Row: {
          affiliate_store_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
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
          {
            foreignKeyName: "shops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string
          product_image_url: string | null
          product_title: string
          quantity: number
          total_price_sar: number
          unit_price_sar: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id: string
          product_image_url?: string | null
          product_title: string
          quantity?: number
          total_price_sar: number
          unit_price_sar: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string
          product_image_url?: string | null
          product_title?: string
          quantity?: number
          total_price_sar?: number
          unit_price_sar?: number
        }
        Relationships: [
          {
            foreignKeyName: "simple_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "simple_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_orders: {
        Row: {
          affiliate_commission_sar: number | null
          affiliate_store_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          order_status: string
          payment_method: string | null
          payment_status: string
          session_id: string | null
          shipping_address: Json
          stripe_payment_intent_id: string | null
          total_amount_sar: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          session_id?: string | null
          shipping_address: Json
          stripe_payment_intent_id?: string | null
          total_amount_sar?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_commission_sar?: number | null
          affiliate_store_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          session_id?: string | null
          shipping_address?: Json
          stripe_payment_intent_id?: string | null
          total_amount_sar?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_orders_affiliate_store_id_fkey"
            columns: ["affiliate_store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simple_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simple_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_notifications: {
        Row: {
          affiliate_store_id: string | null
          clicked_at: string | null
          content: string
          created_at: string
          delivery_status: string | null
          id: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_id: string
          scheduled_for: string | null
          sender_id: string | null
          sent_at: string | null
          store_id: string | null
          subject: string | null
          template_id: string | null
          trigger_event: string | null
        }
        Insert: {
          affiliate_store_id?: string | null
          clicked_at?: string | null
          content: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_id: string
          scheduled_for?: string | null
          sender_id?: string | null
          sent_at?: string | null
          store_id?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_event?: string | null
        }
        Update: {
          affiliate_store_id?: string | null
          clicked_at?: string | null
          content?: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          scheduled_for?: string | null
          sender_id?: string | null
          sent_at?: string | null
          store_id?: string | null
          subject?: string | null
          template_id?: string | null
          trigger_event?: string | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          access_token: string | null
          account_name: string
          account_settings: Json | null
          created_at: string
          id: string
          is_active: boolean
          platform: string
          refresh_token: string | null
          shop_id: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_name: string
          account_settings?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          refresh_token?: string | null
          shop_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_name?: string
          account_settings?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          refresh_token?: string | null
          shop_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          content: string
          created_at: string
          engagement_metrics: Json | null
          error_message: string | null
          external_post_id: string | null
          id: string
          media_urls: Json | null
          post_type: string
          posted_at: string | null
          scheduled_at: string | null
          shop_id: string | null
          social_account_id: string | null
          status: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement_metrics?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          media_urls?: Json | null
          post_type?: string
          posted_at?: string | null
          scheduled_at?: string | null
          shop_id?: string | null
          social_account_id?: string | null
          status?: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_metrics?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          media_urls?: Json | null
          post_type?: string
          posted_at?: string | null
          scheduled_at?: string | null
          shop_id?: string | null
          social_account_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_media_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      store_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_type: string | null
          link_url: string | null
          position: number | null
          store_id: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_type?: string | null
          link_url?: string | null
          position?: number | null
          store_id: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_type?: string | null
          link_url?: string | null
          position?: number | null
          store_id?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_customers: {
        Row: {
          created_at: string
          customer_id: string
          customer_status: string | null
          first_purchase_at: string | null
          id: string
          last_purchase_at: string | null
          notes: string | null
          preferred_contact_method: string | null
          store_id: string
          total_orders: number | null
          total_spent_sar: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_status?: string | null
          first_purchase_at?: string | null
          id?: string
          last_purchase_at?: string | null
          notes?: string | null
          preferred_contact_method?: string | null
          store_id: string
          total_orders?: number | null
          total_spent_sar?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_status?: string | null
          first_purchase_at?: string | null
          id?: string
          last_purchase_at?: string | null
          notes?: string | null
          preferred_contact_method?: string | null
          store_id?: string
          total_orders?: number | null
          total_spent_sar?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_pages: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          is_home_page: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["page_status"] | null
          store_id: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          is_home_page?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["page_status"] | null
          store_id: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          is_home_page?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["page_status"] | null
          store_id?: string
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_store_pages_store"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_store_pages_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "page_templates"
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
      store_shipping_config: {
        Row: {
          auto_tracking_enabled: boolean
          business_hours: Json | null
          created_at: string
          default_provider_id: string | null
          id: string
          notification_settings: Json | null
          pickup_address: Json
          return_address: Json | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          auto_tracking_enabled?: boolean
          business_hours?: Json | null
          created_at?: string
          default_provider_id?: string | null
          id?: string
          notification_settings?: Json | null
          pickup_address: Json
          return_address?: Json | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          auto_tracking_enabled?: boolean
          business_hours?: Json | null
          created_at?: string
          default_provider_id?: string | null
          id?: string
          notification_settings?: Json | null
          pickup_address?: Json
          return_address?: Json | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_shipping_config_default_provider_id_fkey"
            columns: ["default_provider_id"]
            isOneToOne: false
            referencedRelation: "shipping_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_shipping_config_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      store_themes: {
        Row: {
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          name_ar: string
          preview_image_url: string | null
          theme_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          name_ar: string
          preview_image_url?: string | null
          theme_config?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          name_ar?: string
          preview_image_url?: string | null
          theme_config?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          payment_terms: string | null
          phone: string | null
          supplier_name: string
          supplier_number: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          supplier_name: string
          supplier_number: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          supplier_name?: string
          supplier_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_templates: {
        Row: {
          category: string
          color_palette: Json
          created_at: string
          description: string | null
          description_ar: string | null
          difficulty_level: string
          id: string
          is_active: boolean
          is_premium: boolean
          name: string
          name_ar: string
          popularity_score: number
          preview_image_url: string | null
          theme_config: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          color_palette?: Json
          created_at?: string
          description?: string | null
          description_ar?: string | null
          difficulty_level?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name: string
          name_ar: string
          popularity_score?: number
          preview_image_url?: string | null
          theme_config: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          color_palette?: Json
          created_at?: string
          description?: string | null
          description_ar?: string | null
          difficulty_level?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          name?: string
          name_ar?: string
          popularity_score?: number
          preview_image_url?: string | null
          theme_config?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      theme_usage_analytics: {
        Row: {
          action_type: string
          created_at: string
          customizations: Json | null
          id: string
          store_id: string
          template_id: string | null
          theme_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          customizations?: Json | null
          id?: string
          store_id: string
          template_id?: string | null
          theme_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          customizations?: Json | null
          id?: string
          store_id?: string
          template_id?: string | null
          theme_id?: string | null
          user_id?: string
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
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_themes: {
        Row: {
          color_palette: Json
          created_at: string
          id: string
          is_public: boolean
          store_id: string | null
          theme_config: Json
          theme_name: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          color_palette?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          store_id?: string | null
          theme_config: Json
          theme_name: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          color_palette?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          store_id?: string | null
          theme_config?: Json
          theme_name?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: Database["public"]["Enums"]["user_level"]
          id: string
          level_achieved_at: string | null
          level_points: number
          next_level_threshold: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: Database["public"]["Enums"]["user_level"]
          id?: string
          level_achieved_at?: string | null
          level_points?: number
          next_level_threshold?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: Database["public"]["Enums"]["user_level"]
          id?: string
          level_achieved_at?: string | null
          level_points?: number
          next_level_threshold?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            foreignKeyName: "user_mutes_muted_by_fkey"
            columns: ["muted_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["user_level"]
          phone: string | null
          points: number
          role: Database["public"]["Enums"]["user_role"]
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["user_level"]
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["user_level"]
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_themes: {
        Row: {
          created_at: string
          earned_at: string
          earned_reason: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          theme_type: Database["public"]["Enums"]["theme_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          earned_reason?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          theme_type: Database["public"]["Enums"]["theme_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          earned_reason?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          theme_type?: Database["public"]["Enums"]["theme_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_themes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_themes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visual_theme_customizations: {
        Row: {
          affiliate_store_id: string | null
          animation_settings: Json | null
          color_palette: Json | null
          created_at: string
          created_by: string | null
          custom_css: string | null
          custom_variables: Json
          customization_name: string
          customization_type: string
          id: string
          is_active: boolean
          is_global: boolean
          page_id: string | null
          spacing_settings: Json | null
          store_id: string | null
          typography_settings: Json | null
          updated_at: string
        }
        Insert: {
          affiliate_store_id?: string | null
          animation_settings?: Json | null
          color_palette?: Json | null
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          custom_variables?: Json
          customization_name: string
          customization_type?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          page_id?: string | null
          spacing_settings?: Json | null
          store_id?: string | null
          typography_settings?: Json | null
          updated_at?: string
        }
        Update: {
          affiliate_store_id?: string | null
          animation_settings?: Json | null
          color_palette?: Json | null
          created_at?: string
          created_by?: string | null
          custom_css?: string | null
          custom_variables?: Json
          customization_name?: string
          customization_type?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          page_id?: string | null
          spacing_settings?: Json | null
          store_id?: string | null
          typography_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_products: {
        Row: {
          barcode: string | null
          category: string | null
          cost_price: number
          created_at: string
          created_by: string | null
          description: string | null
          dimensions: Json | null
          has_variants: boolean | null
          id: string
          is_active: boolean
          max_stock_level: number | null
          min_stock_level: number | null
          product_name: string
          product_number: string
          profit_margin: number | null
          selling_price: number
          sku: string | null
          supplier_id: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: Json | null
          has_variants?: boolean | null
          id?: string
          is_active?: boolean
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_name: string
          product_number: string
          profit_margin?: number | null
          selling_price?: number
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: Json | null
          has_variants?: boolean | null
          id?: string
          is_active?: boolean
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_name?: string
          product_number?: string
          profit_margin?: number | null
          selling_price?: number
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          city: string | null
          code: string
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
          phone: string | null
          storage_capacity: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
          phone?: string | null
          storage_capacity?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          storage_capacity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          bonus_points: number
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at: string
          description: string
          difficulty_level: string
          end_date: string
          id: string
          metadata: Json | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["challenge_status"]
          target_value: number
          updated_at: string
          winner_alliance_id: string | null
        }
        Insert: {
          bonus_points?: number
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description: string
          difficulty_level?: string
          end_date: string
          id?: string
          metadata?: Json | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["challenge_status"]
          target_value: number
          updated_at?: string
          winner_alliance_id?: string | null
        }
        Update: {
          bonus_points?: number
          challenge_type?: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description?: string
          difficulty_level?: string
          end_date?: string
          id?: string
          metadata?: Json | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          target_value?: number
          updated_at?: string
          winner_alliance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_challenges_winner_alliance_id_fkey"
            columns: ["winner_alliance_id"]
            isOneToOne: false
            referencedRelation: "alliances"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_leaderboard: {
        Row: {
          bonus_earned: number | null
          created_at: string
          customers_count: number
          id: string
          orders_count: number
          points: number
          rank: number | null
          rank_change: number | null
          sales_amount: number
          theme_earned: Database["public"]["Enums"]["theme_type"] | null
          updated_at: string
          user_id: string
          week_number: number
          year_number: number
        }
        Insert: {
          bonus_earned?: number | null
          created_at?: string
          customers_count?: number
          id?: string
          orders_count?: number
          points?: number
          rank?: number | null
          rank_change?: number | null
          sales_amount?: number
          theme_earned?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string
          user_id: string
          week_number: number
          year_number: number
        }
        Update: {
          bonus_earned?: number | null
          created_at?: string
          customers_count?: number
          id?: string
          orders_count?: number
          points?: number
          rank?: number | null
          rank_change?: number | null
          sales_amount?: number
          theme_earned?: Database["public"]["Enums"]["theme_type"] | null
          updated_at?: string
          user_id?: string
          week_number?: number
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
      wishlists: {
        Row: {
          added_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount_sar: number
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          iban: string | null
          id: string
          notes: string | null
          payment_method: string
          phone_number: string | null
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          admin_notes?: string | null
          amount_sar: number
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          phone_number?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          admin_notes?: string | null
          amount_sar?: number
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          phone_number?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            isOneToOne: true
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
      safe_profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          last_activity_at: string | null
          phone: string | null
          points: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          whatsapp: string | null
        }
        Insert: {
          auth_user_id?: never
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          phone?: never
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          whatsapp?: never
        }
        Update: {
          auth_user_id?: never
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          phone?: never
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          whatsapp?: never
        }
        Relationships: []
      }
      security_definer_functions_audit: {
        Row: {
          documentation: string | null
          function_name: unknown | null
          has_security_definer: boolean | null
          owner: unknown | null
          schema_name: unknown | null
          security_status: string | null
        }
        Relationships: []
      }
      v_order_items_unified: {
        Row: {
          commission_rate: number | null
          commission_sar: number | null
          created_at: string | null
          id: string | null
          merchant_id: string | null
          order_id: string | null
          product_id: string | null
          product_title: string | null
          quantity: number | null
          source_table: string | null
          total_price_sar: number | null
          unit_price_sar: number | null
        }
        Relationships: []
      }
      v_orders_unified: {
        Row: {
          affiliate_commission_sar: number | null
          affiliate_store_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string | null
          order_number: string | null
          payment_method: string | null
          payment_status: string | null
          shipping: number | null
          shipping_address: Json | null
          shop_id: string | null
          source_table: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_affiliate_product: {
        Args:
          | {
              p_custom_price?: number
              p_is_visible?: boolean
              p_product_id: string
              p_sort_order?: number
              p_store_id: string
            }
          | {
              p_is_visible?: boolean
              p_product_id: string
              p_sort_order?: number
              p_store_id: string
            }
        Returns: Json
      }
      add_loyalty_points: {
        Args: {
          customer_user_id: string
          points_to_add: number
          shop_uuid: string
          transaction_description?: string
        }
        Returns: string
      }
      apply_theme_to_store: {
        Args: { p_custom_config?: Json; p_store_id: string; p_theme_id: string }
        Returns: boolean
      }
      calculate_final_price: {
        Args: {
          base_price: number
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string
          start_date: string
        }
        Returns: number
      }
      calculate_loyalty_points: {
        Args: { order_amount: number; points_per_riyal?: number }
        Returns: number
      }
      calculate_risk_score: {
        Args: {
          historical_data?: Json
          transaction_data: Json
          user_data: Json
        }
        Returns: number
      }
      calculate_weekly_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_otp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_affiliate_store: {
        Args: { p_bio?: string; p_store_name: string; p_store_slug?: string }
        Returns: string
      }
      create_customer_account: {
        Args: {
          p_email?: string
          p_full_name?: string
          p_phone: string
          p_store_id?: string
        }
        Returns: Json
      }
      create_customer_otp_session: {
        Args: { p_phone: string; p_store_id: string }
        Returns: string
      }
      create_order_from_cart: {
        Args: {
          p_affiliate_store_id?: string
          p_cart_id: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_shipping_address: Json
        }
        Returns: string
      }
      create_user_level: {
        Args: {
          initial_level?: string
          initial_points?: number
          target_user_id: string
        }
        Returns: string
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
      encrypt_sensitive_data: {
        Args: { data_to_encrypt: Json; encryption_level?: string }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_movement_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_refund_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_return_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_shipment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_shipment_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_channel_member_count: {
        Args: { channel_uuid: string }
        Returns: number
      }
      get_current_user_phone: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_product_rating_stats: {
        Args: { p_product_id: string }
        Returns: {
          average_rating: number
          rating_distribution: Json
          total_reviews: number
        }[]
      }
      get_store_orders_for_session: {
        Args: { p_session_id: string; p_store_id: string }
        Returns: {
          created_at: string
          customer_name: string
          customer_phone: string
          items: Json
          order_id: string
          order_number: string
          status: string
          total_amount: number
        }[]
      }
      get_store_theme_config: {
        Args: { p_store_id: string }
        Returns: Json
      }
      get_unified_orders_with_items: {
        Args: {
          p_affiliate_store_id?: string
          p_limit?: number
          p_offset?: number
          p_shop_id?: string
        }
        Returns: {
          created_at: string
          customer_name: string
          customer_phone: string
          items: Json
          order_id: string
          order_number: string
          source_table: string
          status: string
          total: number
        }[]
      }
      get_user_role_cached: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      has_any_role: {
        Args: { allowed_roles: string[]; user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_function_call: {
        Args: {
          additional_context?: Json
          function_name: string
          input_params?: Json
        }
        Returns: undefined
      }
      log_login_attempt: {
        Args: {
          p_attempt_type?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_reason?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      log_product_activity: {
        Args: {
          p_action_type: string
          p_new_data?: Json
          p_old_data?: Json
          p_product_id: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          action_performed?: string
          additional_metadata?: Json
          event_type: string
          resource_accessed?: string
          risk_level?: string
          user_id?: string
        }
        Returns: string
      }
      merge_customer_data: {
        Args: {
          p_email?: string
          p_firebase_uid?: string
          p_name?: string
          p_phone: string
          p_store_id?: string
        }
        Returns: Json
      }
      order_exists_no_rls: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      process_affiliate_order: {
        Args: {
          p_affiliate_store_id: string
          p_order_items: Json
          p_session_id: string
        }
        Returns: Json
      }
      update_customer_tier: {
        Args: { loyalty_record_id: string }
        Returns: undefined
      }
      update_unified_order_status: {
        Args: { p_new_status: string; p_order_id: string }
        Returns: boolean
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_email: string
        }
        Returns: Json
      }
      validate_coupon: {
        Args: {
          coupon_code_input: string
          customer_user_id?: string
          order_amount?: number
          shop_uuid: string
        }
        Returns: Json
      }
      verify_customer_otp: {
        Args:
          | { p_code: string; p_phone: string; p_store_id: string }
          | { p_otp_code: string; p_phone: string; p_store_id?: string }
        Returns: Json
      }
    }
    Enums: {
      alliance_status: "active" | "inactive" | "disbanded"
      challenge_status: "upcoming" | "active" | "completed" | "cancelled"
      challenge_type: "sales" | "customers" | "points" | "mixed"
      content_block_type:
        | "text"
        | "image"
        | "video"
        | "gallery"
        | "button"
        | "form"
        | "products"
        | "custom_html"
      content_type:
        | "page"
        | "section"
        | "widget"
        | "article"
        | "faq"
        | "testimonial"
      discount_type: "percent" | "amount"
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELED"
        | "RETURNED"
      page_status: "draft" | "published" | "scheduled" | "archived"
      payment_method:
        | "CASH_ON_DELIVERY"
        | "CREDIT_CARD"
        | "DEBIT_CARD"
        | "BANK_TRANSFER"
        | "MADA"
        | "APPLE_PAY"
        | "STC_PAY"
        | "WALLET"
      payment_status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
        | "REFUNDED"
      product_status: "draft" | "active" | "inactive" | "archived"
      shipping_method: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP"
      theme_type:
        | "classic"
        | "feminine"
        | "damascus"
        | "modern"
        | "elegant"
        | "gold"
        | "alliance_special"
        | "legendary"
      user_level: "bronze" | "silver" | "gold" | "legendary"
      user_role: "affiliate" | "merchant" | "admin" | "moderator" | "customer"
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
      alliance_status: ["active", "inactive", "disbanded"],
      challenge_status: ["upcoming", "active", "completed", "cancelled"],
      challenge_type: ["sales", "customers", "points", "mixed"],
      content_block_type: [
        "text",
        "image",
        "video",
        "gallery",
        "button",
        "form",
        "products",
        "custom_html",
      ],
      content_type: [
        "page",
        "section",
        "widget",
        "article",
        "faq",
        "testimonial",
      ],
      discount_type: ["percent", "amount"],
      order_status: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
        "RETURNED",
      ],
      page_status: ["draft", "published", "scheduled", "archived"],
      payment_method: [
        "CASH_ON_DELIVERY",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "BANK_TRANSFER",
        "MADA",
        "APPLE_PAY",
        "STC_PAY",
        "WALLET",
      ],
      payment_status: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ],
      product_status: ["draft", "active", "inactive", "archived"],
      shipping_method: ["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"],
      theme_type: [
        "classic",
        "feminine",
        "damascus",
        "modern",
        "elegant",
        "gold",
        "alliance_special",
        "legendary",
      ],
      user_level: ["bronze", "silver", "gold", "legendary"],
      user_role: ["affiliate", "merchant", "admin", "moderator", "customer"],
    },
  },
} as const
