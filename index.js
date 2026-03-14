/**
 * 泓鉴公司 AI 知识助理 - 企业级三级权限知识资产管理系统
 * 实现个人私有库、群组项目库、部门/虚拟团队库的三级权限架构
 */

import axios from 'axios';
import FormData from 'form-data';
import cron from 'node-cron';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs';
import path from 'path';

// 确保数据目录存在
const DATA_DIR = path.join(process.cwd(), '.knowledge-base-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化本地权限数据库
const dbPath = path.join(DATA_DIR, 'permissions.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter);

// 初始化数据库结构
await db.read();
db.data = db.data || {
  group_members: {},      // { groupId: [userId1, userId2...] }
  team_members: {},       // { teamId: [userId1, userId2...] }  
  shared_access: {},      // { knowledgeId: [userIdA, userIdB...] }
  knowledge_index: {}     // { knowledgeId: metadata }
};
await db.write();

// 从环境变量获取配置
const BAILEN_API_KEY = process.env.BAILEN_API_KEY;
const BAILEN_KB_ID = process.env.BAILEN_KB_ID;
const DINGTALK_APP_KEY = process.env.DINGTALK_APP_KEY;
const DINGTALK_APP_SECRET = process.env.DINGTALK_APP_SECRET;

if (!BAILEN_API_KEY || !BAILEN_KB_ID) {
  throw new Error('Missing required environment variables: BAILEN_API_KEY or BAILEN_KB_ID');
}

if (!DINGTALK_APP_KEY || !DINGTALK_APP_SECRET) {
  throw new Error('Missing required environment variables: DINGTALK_APP_KEY or DINGTALK_APP_SECRET');
}

// API 配置
const BAILAN_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';
const DINGTALK_BASE_URL = 'https://oapi.dingtalk.com';

let dingtalkAccessTokenCache = null;
let dingtalkAccessTokenExpiry = 0;

/**
 * 权限映射管理器
 */
class PermissionManager {
  /**
   * 获取钉钉访问令牌（带缓存）
   */
  static async getDingTalkAccessToken() {
    const now = Date.now();
    if (dingtalkAccessTokenCache && dingtalkAccessTokenExpiry > now + 60000) {
      return dingtalkAccessTokenCache;
    }
    
    try {
      const response = await axios.get(`${DINGTALK_BASE_URL}/gettoken`, {
        params: { appkey: DINGTALK_APP_KEY, appsecret: DINGTALK_APP_SECRET },
        timeout: 5000
      });
      
      if (response.data.errcode === 0) {
        dingtalkAccessTokenCache = response.data.access_token;
        dingtalkAccessTokenExpiry = now + (response.data.expires_in * 1000);
        return dingtalkAccessTokenCache;
      }
      throw new Error(`Failed to get DingTalk token: ${response.data.errmsg}`);
    } catch (error) {
      console.error('DingTalk token error:', error.message);
      // 如果获取失败，使用缓存的旧 token（如果存在）
      if (dingtalkAccessTokenCache) {
        return dingtalkAccessTokenCache;
      }
      throw error;
    }
  }

  /**
   * 同步群成员列表到本地缓存
   */
  static async syncGroupMembers(groupId) {
    try {
      const accessToken = await this.getDingTalkAccessToken();
      const response = await axios.post(
        `${DINGTALK_BASE_URL}/chat/getChatMemberList`,
        { chatid: groupId },
        {
          params: { access_token: accessToken },
          timeout: 10000
        }
      );
      
      if (response.data.errcode === 0) {
        const memberIds = response.data.memberList?.map(m => m.userid) || [];
        await db.read();
        db.data.group_members[groupId] = memberIds;
        await db.write();
        return memberIds;
      }
      return db.data.group_members[groupId] || [];
    } catch (error) {
      console.error(`Failed to sync group members for ${groupId}:`, error.message);
      // 返回缓存数据
      return db.data.group_members[groupId] || [];
    }
  }

  /**
   * 同步所有活跃群的成员列表
   */
  static async syncAllGroups() {
    await db.read();
    const groups = Object.keys(db.data.group_members);
    for (const groupId of groups) {
      await this.syncGroupMembers(groupId);
    }
  }

  /**
   * 检查用户对特定知识的访问权限
   */
  static async checkAccess(userId, metadata) {
    await db.read();
    
    switch (metadata.type) {
      case 'private':
        // 个人私有库：所有者或共享用户
        if (userId === metadata.owner) {
          return true;
        }
        const sharedUsers = db.data.shared_access[metadata.id] || [];
        return sharedUsers.includes(userId);
        
      case 'group':
        // 群组项目库：当前群成员
        const groupMembers = db.data.group_members[metadata.groupId] || [];
        return groupMembers.includes(userId);
        
      case 'team':
        // 部门/团队库：团队成员
        const teamMembers = db.data.team_members[metadata.teamId] || [];
        return teamMembers.includes(userId);
        
      default:
        return false;
    }
  }

  /**
   * 获取用户有权访问的所有群组ID
   */
  static async getUserAllowedGroups(userId) {
    await db.read();
    const allowedGroups = [];
    for (const [groupId, members] of Object.entries(db.data.group_members)) {
      if (members.includes(userId)) {
        allowedGroups.push(groupId);
      }
    }
    return allowedGroups;
  }

  /**
   * 获取用户有权访问的所有团队ID
   */
  static async getUserAllowedTeams(userId) {
    await db.read();
    const allowedTeams = [];
    for (const [teamId, members] of Object.entries(db.data.team_members)) {
      if (members.includes(userId)) {
        allowedTeams.push(teamId);
      }
    }
    return allowedTeams;
  }

  /**
   * 获取用户被共享的私有知识ID列表
   */
  static async getUserSharedPrivateDocs(userId) {
    await db.read();
    const sharedDocs = [];
    for (const [docId, users] of Object.entries(db.data.shared_access)) {
      if (users.includes(userId)) {
        sharedDocs.push(docId);
      }
    }
    return sharedDocs;
  }

  /**
   * 添加知识共享权限
   */
  static async addSharedAccess(knowledgeId, targetUserId) {
    await db.read();
    if (!db.data.shared_access[knowledgeId]) {
      db.data.shared_access[knowledgeId] = [];
    }
    if (!db.data.shared_access[knowledgeId].includes(targetUserId)) {
      db.data.shared_access[knowledgeId].push(targetUserId);
      await db.write();
    }
  }

  /**
   * 移除知识共享权限
   */
  static async removeSharedAccess(knowledgeId, targetUserId) {
    await db.read();
    if (db.data.shared_access[knowledgeId]) {
      db.data.shared_access[knowledgeId] = 
        db.data.shared_access[knowledgeId].filter(uid => uid !== targetUserId);
      await db.write();
    }
  }
}

/**
 * 百炼知识库客户端
 */
class BailenClient {
  static async uploadToBailen(content, metadata, fileName = 'document', isText = false) {
    const headers = { 'Authorization': `Bearer ${BAILEN_API_KEY}` };
    
    // 生成唯一知识ID
    const knowledgeId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    metadata.id = knowledgeId;
    
    try {
      let response;
      if (isText) {
        response = await axios.post(
          `${BAILAN_BASE_URL}/knowledge-bases/${BAILEN_KB_ID}/documents`,
          { content, metadata, knowledge_base_id: BAILEN_KB_ID },
          { headers, timeout: 10000 }
        );
      } else {
        const formData = new FormData();
        formData.append('file', Buffer.isBuffer(content) ? content : Buffer.from(content), fileName);
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('knowledge_base_id', BAILEN_KB_ID);
        
        response = await axios.post(
          `${BAILAN_BASE_URL}/knowledge-bases/${BAILEN_KB_ID}/documents`,
          formData,
          { headers: { ...headers, ...formData.getHeaders() }, timeout: 30000 }
        );
      }
      
      // 记录知识索引
      await db.read();
      db.data.knowledge_index[knowledgeId] = metadata;
      await db.write();
      
      return { ...response.data, knowledgeId };
    } catch (error) {
      console.error('Bailen upload error:', error.message);
      throw error;
    }
  }

  static async deleteFromBailen(knowledgeId) {
    const headers = { 'Authorization': `Bearer ${BAILEN_API_KEY}` };
    try {
      // 软删除：更新元数据标记
      await db.read();
      const metadata = db.data.knowledge_index[knowledgeId];
      if (metadata) {
        metadata.is_deleted = true;
        await db.write();
        
        // 这里可以调用百炼的更新接口，或者在检索时过滤
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bailen delete error:', error.message);
      return false;
    }
  }

  static async retrieveFromBailen(query, filter = {}) {
    const headers = { 'Authorization': `Bearer ${BAILEN_API_KEY}` };
    const requestBody = {
      query,
      knowledge_base_id: BAILEN_KB_ID,
      top_k: 5,
      score_threshold: 0.6,
      ...(Object.keys(filter).length > 0 ? { filter } : {})
    };
    
    try {
      const response = await axios.post(
        `${BAILAN_BASE_URL}/knowledge-bases/${BAILEN_KB_ID}/retrieve`,
        requestBody,
        { headers, timeout: 15000 }
      );
      
      // 过滤已删除的知识
      const results = (response.data.results || []).filter(result => {
        const metadata = result.metadata || {};
        return !metadata.is_deleted;
      });
      
      return results;
    } catch (error) {
      console.error('Bailen retrieve error:', error.message);
      return [];
    }
  }
}

/**
 * 智能归档引擎
 */
class IngestionEngine {
  /**
   * 处理私聊消息归档
   */
  static async handlePrivateMessage(senderId, content) {
    if (content.trim().length <= 5) return null;
    
    // 检查是否为删除指令
    if (this.isDeleteCommand(content)) {
      await this.handleDeleteCommand(senderId, content);
      return { handled: true, reply: '✅ 相关知识已删除！' };
    }
    
    // 检查是否为共享指令
    if (this.isTransferCommand(content)) {
      await this.handleTransferCommand(senderId, content);
      return { handled: true, reply: '✅ 知识共享已设置！' };
    }
    
    // 正常归档
    const metadata = {
      type: 'private',
      owner: senderId,
      created_at: new Date().toISOString(),
      tags: this.extractTags(content)
    };
    
    await BailenClient.uploadToBailen(content.trim(), metadata, 'private.txt', true);
    return { handled: true, reply: '✅ 已保存到您的个人知识库！' };
  }

  /**
   * 处理群聊消息归档
   */
  static async handleGroupMessage(senderId, conversationId, content, isMentioned, attachments = []) {
    // 文件自动归档
    if (attachments.length > 0) {
      await this.handleFileAttachments(senderId, conversationId, attachments);
      return { handled: true, silent: true };
    }
    
    // 显式记录指令
    if (isMentioned && this.isRecordCommand(content)) {
      const cleanContent = content.replace(/@\w+/g, '').trim();
      await this.handleExplicitRecord(senderId, conversationId, cleanContent);
      return { handled: true, reply: '✅ 已成功归档到群组知识库！' };
    }
    
    // 高频话题检测（简化实现）
    if (this.isHighFrequencyTopic(conversationId, content)) {
      await this.handleImplicitRecord(senderId, conversationId, content);
      return { handled: true, silent: true };
    }
    
    return { handled: false };
  }

  /**
   * 处理文件附件
   */
  static async handleFileAttachments(senderId, groupId, attachments) {
    const supportedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];
    
    for (const attachment of attachments) {
      const { url, mediaId, fileName } = attachment;
      const fileExt = (fileName || '').split('.').pop().toLowerCase();
      
      if (supportedTypes.includes(fileExt)) {
        try {
          const accessToken = await PermissionManager.getDingTalkAccessToken();
          const fileResponse = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            responseType: 'arraybuffer'
          });
          
          const metadata = {
            type: 'group',
            groupId: groupId,
            owner: senderId,
            file_name: fileName,
            uploaded_at: new Date().toISOString()
          };
          
          await BailenClient.uploadToBailen(Buffer.from(fileResponse.data), metadata, fileName, false);
          
          // 确保群信息在缓存中
          await db.read();
          if (!db.data.group_members[groupId]) {
            db.data.group_members[groupId] = [];
          }
          await db.write();
          
        } catch (error) {
          console.error(`Failed to archive file ${fileName}:`, error.message);
        }
      }
    }
  }

  /**
   * 处理显式记录指令
   */
  static async handleExplicitRecord(senderId, groupId, content) {
    const metadata = {
      type: 'group',
      groupId: groupId,
      owner: senderId,
      created_at: new Date().toISOString(),
      tags: this.extractTags(content)
    };
    
    await BailenClient.uploadToBailen(content, metadata, 'group_record.txt', true);
  }

  /**
   * 处理隐式记录（高频话题）
   */
  static async handleImplicitRecord(senderId, groupId, content) {
    // 简化实现：直接归档
    const metadata = {
      type: 'group',
      groupId: groupId,
      owner: senderId,
      created_at: new Date().toISOString(),
      implicit: true
    };
    
    await BailenClient.uploadToBailen(content, metadata, 'implicit_record.txt', true);
  }

  /**
   * 处理删除指令
   */
  static async handleDeleteCommand(ownerId, content) {
    // 简化实现：标记所有匹配主题的私有知识为删除
    await db.read();
    for (const [knowledgeId, metadata] of Object.entries(db.data.knowledge_index)) {
      if (metadata.type === 'private' && metadata.owner === ownerId) {
        // 这里可以添加更复杂的主题匹配逻辑
        if (content.includes('以上话题') || content.includes('不用记录')) {
          metadata.is_deleted = true;
        }
      }
    }
    await db.write();
  }

  /**
   * 处理知识共享指令
   */
  static async handleTransferCommand(ownerId, content) {
    // 解析 "把 A 的经验传给 B" 或 "/transfer A to B"
    const transferMatch = content.match(/(?:把|将)?\s*(.+?)\s*(?:的经验|知识)?\s*传给\s*(.+)|\/transfer\s+(\w+)\s+to\s+(\w+)/i);
    
    if (transferMatch) {
      let topic, targetUser;
      if (transferMatch[1] && transferMatch[2]) {
        topic = transferMatch[1].trim();
        targetUser = transferMatch[2].trim();
      } else if (transferMatch[3] && transferMatch[4]) {
        topic = transferMatch[3].trim();
        targetUser = transferMatch[4].trim();
      }
      
      if (topic && targetUser) {
        // 找到匹配主题的私有知识并共享
        await db.read();
        for (const [knowledgeId, metadata] of Object.entries(db.data.knowledge_index)) {
          if (metadata.type === 'private' && metadata.owner === ownerId) {
            // 简化匹配：检查内容是否包含主题关键词
            if (metadata.tags?.some(tag => tag.includes(topic)) || 
                (metadata.content && metadata.content.includes(topic))) {
              await PermissionManager.addSharedAccess(knowledgeId, targetUser);
            }
          }
        }
        await db.write();
      }
    }
  }

  /**
   * 检查是否为删除指令
   */
  static isDeleteCommand(content) {
    return /删除.*知识|以上话题.*不用记录/.test(content);
  }

  /**
   * 检查是否为共享指令
   */
  static isTransferCommand(content) {
    return /(?:把|将).*传给|\/transfer/.test(content);
  }

  /**
   * 检查是否为记录指令
   */
  static isRecordCommand(content) {
    return /记录本次讨论|\/team.*记录|记下来|归档|收藏/.test(content);
  }

  /**
   * 检查是否为高频话题（简化实现）
   */
  static isHighFrequencyTopic(groupId, content) {
    // 简化实现：返回 false，实际应用中需要更复杂的语义分析
    return false;
  }

  /**
   * 提取标签
   */
  static extractTags(content) {
    // 简化实现：提取关键词作为标签
    const keywords = ['React', 'Vue', 'AI', '机器学习', '产品', '项目', '技术'];
    return keywords.filter(keyword => content.includes(keyword));
  }
}

/**
 * 安全检索引擎
 */
class SecureRagEngine {
  static async searchKnowledge(userId, query) {
    // 构建动态过滤器
    const allowedGroups = await PermissionManager.getUserAllowedGroups(userId);
    const allowedTeams = await PermissionManager.getUserAllowedTeams(userId);
    const sharedPrivateDocs = await PermissionManager.getUserSharedPrivateDocs(userId);
    
    const filter = {
      $or: [
        { "metadata.type": "private", "metadata.owner": userId },
        ...(sharedPrivateDocs.length > 0 ? 
          [{ "metadata.type": "private", "metadata.id": { $in: sharedPrivateDocs } }] : []),
        ...(allowedGroups.length > 0 ? 
          [{ "metadata.type": "group", "metadata.groupId": { $in: allowedGroups } }] : []),
        ...(allowedTeams.length > 0 ? 
          [{ "metadata.type": "team", "metadata.teamId": { $in: allowedTeams } }] : [])
      ]
    };
    
    const results = await BailenClient.retrieveFromBailen(query, filter);
    return results;
  }
}

/**
 * 启动定时同步任务（每10分钟）
 */
cron.schedule('*/10 * * * *', async () => {
  try {
    await PermissionManager.syncAllGroups();
    console.log('✅ 群成员权限同步完成');
  } catch (error) {
    console.error('❌ 群成员同步失败:', error.message);
  }
});

/**
 * 主技能函数
 */
export async function handleKnowledgeBase(context, message) {
  const { content, senderId, conversationId, chatType, isMentioned, attachments = [] } = message;
  const isGroupChat = chatType === 'group';
  
  try {
    if (isGroupChat) {
      // 群聊处理
      const result = await IngestionEngine.handleGroupMessage(
        senderId, 
        conversationId, 
        content, 
        isMentioned, 
        attachments
      );
      
      if (result.handled) {
        return result;
      }
      
      // 群聊问答
      if (content && content.trim().length > 0) {
        const results = await SecureRagEngine.searchKnowledge(senderId, content.trim());
        if (results.length > 0) {
          const relevantInfo = results.map(r => r.content).join('\n\n');
          const answer = `根据知识库信息：\n\n${relevantInfo}\n\n（以上信息来自泓鉴公司AI知识助理）`;
          return { handled: true, reply: answer };
        }
      }
      
    } else {
      // 私聊处理
      const result = await IngestionEngine.handlePrivateMessage(senderId, content);
      
      if (result.handled) {
        return result;
      }
      
      // 私聊问答
      if (content && content.trim().length > 0) {
        const results = await SecureRagEngine.searchKnowledge(senderId, content.trim());
        if (results.length > 0) {
          const relevantInfo = results.map(r => r.content).join('\n\n');
          const answer = `根据知识库信息：\n\n${relevantInfo}\n\n（以上信息来自泓鉴公司AI知识助理）`;
          return { handled: true, reply: answer };
        }
      }
    }
    
    return { handled: false };
  } catch (error) {
    console.error('Knowledge base processing error:', error.message);
    return { handled: false };
  }
}

/**
 * 导出工具函数
 */
export const tools = {
  /**
   * 带权限的安全搜索
   */
  async search_knowledge(query, userId) {
    return await SecureRagEngine.searchKnowledge(userId, query);
  },
  
  /**
   * 触发知识共享
   */
  async transfer_knowledge(fromUser, toUser, topic) {
    // 创建一个模拟的共享指令
    const fakeContent = `把 ${topic} 的经验传给 ${toUser}`;
    await IngestionEngine.handleTransferCommand(fromUser, fakeContent);
  },
  
  /**
   * 触发知识删除
   */
  async delete_knowledge(topic, ownerId) {
    // 创建一个模拟的删除指令
    const fakeContent = `删除关于 ${topic} 的知识`;
    await IngestionEngine.handleDeleteCommand(ownerId, fakeContent);
  },
  
  /**
   * 手动触发成员同步
   */
  async sync_group_members() {
    await PermissionManager.syncAllGroups();
  }
};

// 导出技能元数据
export const skill = {
  name: 'knowledge-base',
  description: '泓鉴公司 AI 知识助理 - 企业级三级权限知识资产管理系统',
  version: '2.0.0',
  handle: handleKnowledgeBase,
  tools: tools
};