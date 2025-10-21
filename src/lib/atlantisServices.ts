import { supabase } from '@/integrations/supabase/client';
import { API_ENDPOINTS, POINT_VALUES } from '@/utils/constants';
import { logger } from '@/utils/logger';

interface AtlantisPointsUpdateData {
  action: 'sale_completed' | 'new_customer' | 'challenge_completed' | 'manual_add';
  amount?: number;
  metadata?: any;
}

export class AtlantisPointsService {
  /**
   * Add points to current user based on action
   */
  static async addPoints(data: AtlantisPointsUpdateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: result, error } = await supabase.functions.invoke(API_ENDPOINTS.ATLANTIS_POINTS, {
        body: {
          userId: user.id,
          ...data
        }
      });

      if (error) throw error;

      return result;
    } catch (error) {
      logger.error('Error adding Atlantis points', { error, data });
      throw error;
    }
  }

  /**
   * Add points for completed sale
   */
  static async addSalePoints(saleAmount: number, metadata: any = {}) {
    return this.addPoints({
      action: 'sale_completed',
      amount: saleAmount,
      metadata
    });
  }

  /**
   * Add points for new customer acquisition
   */
  static async addNewCustomerPoints(metadata: any = {}) {
    return this.addPoints({
      action: 'new_customer',
      metadata
    });
  }

  /**
   * Add points for challenge completion
   */
  static async addChallengePoints(challengeName: string, bonusPoints: number, metadata: any = {}) {
    return this.addPoints({
      action: 'challenge_completed',
      metadata: {
        challenge_name: challengeName,
        bonus_points: bonusPoints,
        ...metadata
      }
    });
  }

  /**
   * Manual points addition (admin only)
   */
  static async addManualPoints(amount: number, reason: string, metadata: any = {}) {
    return this.addPoints({
      action: 'manual_add',
      amount,
      metadata: {
        reason,
        ...metadata
      }
    });
  }
}

/**
 * Text-to-Speech Service using ElevenLabs
 */
export class AtlantisTTSService {
  /**
   * Convert text to speech and return audio data
   */
  static async textToSpeech(
    text: string, 
    voiceId: string = "9BWtsMINqrJLrRacOk9x",
    modelId: string = "eleven_multilingual_v2"
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('atlantis-tts', {
        body: {
          text,
          voice_id: voiceId,
          model_id: modelId
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Play text as speech audio
   */
  static async playText(text: string, voiceId?: string, modelId?: string) {
    try {
      const response = await this.textToSpeech(text, voiceId, modelId);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      // Convert base64 to audio blob
      const audioData = atob(response.audio);
      const audioBuffer = new ArrayBuffer(audioData.length);
      const audioView = new Uint8Array(audioBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        audioView[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Error playing speech:', error);
      throw error;
    }
  }

  /**
   * Pre-defined speech messages for common Atlantis events
   */
  static async playLevelUpSound(newLevel: string) {
    const messages = {
      silver: "تهانينا! وصلت للمستوى الفضي! أصبح بإمكانك الآن إنشاء تحالف خاص بك!",
      gold: "مبروك! وصلت للمستوى الذهبي! لقد حصلت على مميزات جديدة وزيادة في العمولة!",
      legendary: "رائع! وصلت للمستوى الأسطوري! أنت الآن من النخبة ولديك أعلى المميزات!"
    };

    const message = messages[newLevel as keyof typeof messages] || `تهانينا! وصلت لمستوى جديد: ${newLevel}`;
    
    return this.playText(message);
  }

  static async playAchievementSound(achievementName: string) {
    return this.playText(`تهانينا! حققت إنجازاً جديداً: ${achievementName}!`);
  }

  static async playNewChallengeSound(challengeName: string) {
    return this.playText(`تحدي جديد متاح: ${challengeName}. هل أنت مستعد للمنافسة؟`);
  }

  static async playRankUpSound(newRank: number) {
    return this.playText(`ممتاز! تقدمت في الترتيب ووصلت للمركز رقم ${newRank}!`);
  }
}