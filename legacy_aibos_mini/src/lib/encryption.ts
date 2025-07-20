import crypto from 'crypto';

export class EncryptionManager {
  private static instance: EncryptionManager;
  private governanceKey: string;
  private algorithm = 'aes-256-gcm';

  constructor() {
    this.governanceKey = process.env.GOVERNANCE_ENCRYPTION_KEY!;
    if (!this.governanceKey) {
      throw new Error('GOVERNANCE_ENCRYPTION_KEY environment variable is required');
    }
  }

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.governanceKey);
    cipher.setAAD(Buffer.from('governance-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.governanceKey);
    decipher.setAAD(Buffer.from('governance-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}