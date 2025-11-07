import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

export class DocumentService {
  constructor() {
    this.documentsCollection = collection(db, 'documents');
    this.chunksCollection = collection(db, 'document_chunks');
  }

  async uploadDocument(filename, fileSize, chunks) {
    try {
      // Create document record
      const docRef = await addDoc(this.documentsCollection, {
        filename,
        fileSize,
        totalChunks: chunks.length,
        uploadDate: new Date().toISOString()
      });

      // Store chunks
      for (let i = 0; i < chunks.length; i++) {
        await addDoc(this.chunksCollection, {
          documentId: docRef.id,
          chunkIndex: i,
          content: chunks[i].content,
          embedding: chunks[i].embedding
        });
      }

      return {
        documentId: docRef.id,
        chunksCreated: chunks.length
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async listDocuments() {
    try {
      const q = query(this.documentsCollection, orderBy('uploadDate', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      // Delete document
      await deleteDoc(doc(db, 'documents', documentId));
      
      // Delete associated chunks
      const chunksQuery = query(this.chunksCollection);
      const chunksSnapshot = await getDocs(chunksQuery);
      
      const deletePromises = chunksSnapshot.docs
        .filter(chunkDoc => chunkDoc.data().documentId === documentId)
        .map(chunkDoc => deleteDoc(chunkDoc.ref));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async searchChunks(queryEmbedding, topK = 3) {
    try {
      const snapshot = await getDocs(this.chunksCollection);
      
      const chunksWithScores = snapshot.docs.map(doc => {
        const data = doc.data();
        const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
        return {
          ...data,
          similarity
        };
      });

      // Sort by similarity and return top K
      return chunksWithScores
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .filter(chunk => chunk.similarity > 0.3);
    } catch (error) {
      console.error('Error searching chunks:', error);
      throw error;
    }
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
