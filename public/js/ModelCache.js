/**
 * ModelCache - IndexedDB 缓存管理器
 * 用于缓存解析后的3D模型数据，避免重复解析OBJ文件
 */

class ModelCache {
    constructor() {
        this.dbName = 'BodyParts3D_DB';
        this.dbVersion = 1;
        this.db = null;
        this.isOpen = false;
        this.initFailed = false; // 标记初始化是否失败
        this.initPromise = null; // 避免重复初始化
        this.memoryCache = new Map(); // 内存缓存，提升二次访问速度
    }

    /**
     * 初始化数据库
     */
    async init() {
        if (this.isOpen) return;
        if (this.initFailed) throw new Error('IndexedDB init previously failed');
        if (this.initPromise) return this.initPromise; // 避免重复初始化
        
        // 检查浏览器是否支持 IndexedDB
        if (!window.indexedDB) {
            this.initFailed = true;
            throw new Error('IndexedDB not supported');
        }
        
        this.initPromise = new Promise((resolve, reject) => {
            let request;
            try {
                request = indexedDB.open(this.dbName, this.dbVersion);
            } catch (e) {
                this.initFailed = true;
                reject(new Error('Failed to open IndexedDB: ' + e.message));
                return;
            }
            
            request.onerror = (event) => {
              