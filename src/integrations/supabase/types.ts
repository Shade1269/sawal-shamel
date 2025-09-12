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
      affiliate_products: {
        Row: {
          added_at: string | null
          affiliate_store_id: string | null
          id: string
          is_visible: boolean
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          added_at?: string | null
          affiliate_store_id?: string | null
          id?: string
          is_visible?: boolean
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          added_at?: string | null
          affiliate_store_id?: string | null
          id?: string
          is_visible?: boolean
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
      affiliate_stores: {
        Row: {
          bio: string | null
          created_at: string | null
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
      inventory_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          last_counted_at: string | null
          location_in_warehouse: string | null
          max_stock_level: number | null
          product_id: string | null
          quantity_available: number | null
          quantity_on_order: number | null
          quantity_reserved: number | null
          reorder_level: number | null
          sku: string
          unit_cost: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_counted_at?: string | null
          location_in_warehouse?: string | null
          max_stock_level?: number | null
          product_id?: string | null
          quantity_available?: number | null
          quantity_on_order?: number | null
          quantity_reserved?: number | null
          reorder_level?: number | null
          sku: string
          unit_cost?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_counted_at?: string | null
          location_in_warehouse?: string | null
          max_stock_level?: number | null
          product_id?: string | null
          quantity_available?: number | null
          quantity_on_order?: number | null
          quantity_reserved?: number | null
          reorder_level?: number | null
          sku?: string
          unit_cost?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          created_at: string | null
          id: string
          inventory_item_id: string | null
          movement_type: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          inventory_item_id: string | null
          order_id: string | null
          reserved_quantity: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          inventory_item_id?: string | null
          order_id?: string | null
          reserved_quantity: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          inventory_item_id?: string | null
          order_id?: string | null
          reserved_quantity?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
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
      order_items: {
        Row: {
          commission_rate: number
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
          images: Json | null
          is_active: boolean
          last_viewed_at: string | null
          merchant_id: string
          price_sar: number
          sales_count: number | null
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
          images?: Json | null
          is_active?: boolean
          last_viewed_at?: string | null
          merchant_id: string
          price_sar: number
          sales_count?: number | null
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
          images?: Json | null
          is_active?: boolean
          last_viewed_at?: string | null
          merchant_id?: string
          price_sar?: number
          sales_count?: number | null
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
          level: Database["public"]["Enums"]["user_level"] | null
          phone: string | null
          points: number
          role: Database["public"]["Enums"]["user_role"]
          total_earnings: number | null
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
          level?: Database["public"]["Enums"]["user_level"] | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
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
          level?: Database["public"]["Enums"]["user_level"] | null
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_earnings?: number | null
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
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          inventory_item_id: string | null
          is_resolved: boolean | null
          message: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_resolved?: boolean | null
          message: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_resolved?: boolean | null
          message?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
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
      warehouses: {
        Row: {
          address: Json | null
          capacity_limit: number | null
          code: string
          created_at: string | null
          current_utilization: number | null
          id: string
          is_active: boolean | null
          location: string | null
          manager_id: string | null
          name: string
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          capacity_limit?: number | null
          code: string
          created_at?: string | null
          current_utilization?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager_id?: string | null
          name: string
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          capacity_limit?: number | null
          code?: string
          created_at?: string | null
          current_utilization?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager_id?: string | null
          name?: string
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_refund_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_shipment_number: {
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
      theme_type: "classic" | "feminine" | "damascus"
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
      order_status: [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
        "RETURNED",
      ],
      theme_type: ["classic", "feminine", "damascus"],
      user_level: ["bronze", "silver", "gold", "legendary"],
      user_role: ["affiliate", "merchant", "admin", "moderator", "customer"],
    },
  },
} as const
