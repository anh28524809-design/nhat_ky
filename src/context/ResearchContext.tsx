import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  storage,
  testConnection,
} from '../lib/firebase';
import {
  AppendixDocument,
  EvidenceItem,
  JournalEntry,
  ResearchStage,
  UserRole,
} from '../types/research';
import {
  INITIAL_APPENDICES,
  INITIAL_EVIDENCES,
  INITIAL_JOURNALS,
  INITIAL_STAGES,
} from '../data/initialResearchData';
import { buildNextJournalRevision } from '../utils/researchLogic';

interface ResearchContextValue {
  user: User | null;
  authReady: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isConnectedToFirestore: boolean;
  isSyncingSeed: boolean;
  stages: ResearchStage[];
  journals: JournalEntry[];
  evidences: EvidenceItem[];
  appendices: AppendixDocument[];
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncInitialDossierToFirestore: () => Promise<void>;
  saveStage: (stage: ResearchStage) => Promise<void>;
  createJournalEntry: (
    entry: Omit<
      JournalEntry,
      'id' | 'version' | 'revisionHistory' | 'authorUid' | 'authorName' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  verifyJournalEntryAsTeacher: (
    id: string,
    reviewStatus: 'verified' | 'revision_requested',
    teacherComment: string,
    teacherConfirmationNote: string
  ) => Promise<void>;
  uploadEvidenceFile: (
    file: File | null,
    metadata: {
      fileName: string;
      description: string;
      evidenceType: EvidenceItem['evidenceType'];
      providerName: string;
      collectionDate: string;
      journalCode: string;
      stageNumber: number;
      manualStorageUrl?: string;
    },
    onProgress?: (percent: number) => void
  ) => Promise<void>;
  toggleEvidenceApprovalAsTeacher: (
    evidenceId: string,
    isApprovedForJury: boolean,
    isFeatured: boolean
  ) => Promise<void>;
  deleteEvidenceItem: (evidenceId: string) => Promise<void>;
  updateAppendixDocument: (appendix: AppendixDocument) => Promise<void>;
}

const ResearchContext = createContext<ResearchContextValue | undefined>(undefined);

function getRoleDisplayName(role: UserRole, user: User | null): string {
  if (role === 'teacher_thuy_mai') return 'GV Vũ Thúy Mai';
  if (role === 'student_duc_anh') return 'Vương Đức Anh (12 Hóa Sinh)';
  if (role === 'student_khanh_an') return 'Đàm Khánh An (11 Hóa)';
  return user?.displayName || 'Hội đồng Giám khảo';
}

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('jury');
  const [isConnectedToFirestore, setIsConnectedToFirestore] = useState<boolean>(false);
  const [isSyncingSeed, setIsSyncingSeed] = useState<boolean>(false);

  const [stages, setStages] = useState<ResearchStage[]>(INITIAL_STAGES);
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNALS);
  const [evidences, setEvidences] = useState<EvidenceItem[]>(INITIAL_EVIDENCES);
  const [appendices, setAppendices] = useState<AppendixDocument[]>(INITIAL_APPENDICES);

  useEffect(() => {
    testConnection().then((ok) => setIsConnectedToFirestore(ok));
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        const email = (currentUser.email || '').toLowerCase();
        if (email.includes('vtmmeomeo1990')) {
          setActiveRole('teacher_thuy_mai');
        } else if (activeRole === 'jury') {
          setActiveRole('student_duc_anh');
        }
      } else {
        setActiveRole('jury');
      }
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to Firestore collections when user is authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    const unsubStages = onSnapshot(
      collection(db, 'stages'),
      (snap) => {
        if (!snap.empty) {
          const loaded: ResearchStage[] = [];
          snap.forEach((d) => {
            loaded.push({ ...(d.data() as ResearchStage), id: d.id });
          });
          loaded.sort((a, b) => a.stageNumber - b.stageNumber);
          setStages(loaded);
        }
      },
      (err) => {
        console.warn('Firestore stages listener info:', err.message);
      }
    );

    const unsubJournals = onSnapshot(
      collection(db, 'journals'),
      (snap) => {
        if (!snap.empty) {
          const loaded: JournalEntry[] = [];
          snap.forEach((d) => {
            loaded.push({ ...(d.data() as JournalEntry), id: d.id });
          });
          loaded.sort((a, b) => a.orderIndex - b.orderIndex);
          setJournals(loaded);
        }
      },
      (err) => {
        console.warn('Firestore journals listener info:', err.message);
      }
    );

    const unsubEvidences = onSnapshot(
      collection(db, 'evidences'),
      (snap) => {
        if (!snap.empty) {
          const loaded: EvidenceItem[] = [];
          snap.forEach((d) => {
            loaded.push({ ...(d.data() as EvidenceItem), id: d.id });
          });
          setEvidences(loaded);
        }
      },
      (err) => {
        console.warn('Firestore evidences listener info:', err.message);
      }
    );

    const unsubAppendices = onSnapshot(
      collection(db, 'appendices'),
      (snap) => {
        if (!snap.empty) {
          const loaded: AppendixDocument[] = [];
          snap.forEach((d) => {
            loaded.push({ ...(d.data() as AppendixDocument), id: d.id });
          });
          setAppendices(loaded);
        }
      },
      (err) => {
        console.warn('Firestore appendices listener info:', err.message);
      }
    );

    return () => {
      unsubStages();
      unsubJournals();
      unsubEvidences();
      unsubAppendices();
    };
  }, [authReady, user]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setActiveRole('jury');
  };

  const syncInitialDossierToFirestore = async () => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập tài khoản Google trước khi ghi dữ liệu lên Firestore.');
    }
    setIsSyncingSeed(true);
    try {
      for (const st of INITIAL_STAGES) {
        const payload = {
          stageNumber: st.stageNumber,
          title: st.title.slice(0, 200),
          period: st.period.slice(0, 100),
          shortDescription: st.shortDescription.slice(0, 600),
          status: st.status,
          activities: st.activities.slice(0, 20),
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'stages', st.id), payload);
      }

      for (const jn of INITIAL_JOURNALS) {
        const payload = {
          code: jn.code.slice(0, 40),
          orderIndex: jn.orderIndex,
          stageNumber: jn.stageNumber,
          activityName: jn.activityName.slice(0, 300),
          actualDateOrRange: jn.actualDateOrRange.slice(0, 120),
          dateCertainty: jn.dateCertainty,
          dataOriginType: jn.dataOriginType,
          location: jn.location.slice(0, 200),
          performer: jn.performer.slice(0, 200),
          collaborators: jn.collaborators.slice(0, 200),
          objective: jn.objective.slice(0, 1000),
          workDone: jn.workDone.slice(0, 3000),
          method: jn.method.slice(0, 1500),
          actualResult: jn.actualResult.slice(0, 1500),
          difficulties: jn.difficulties.slice(0, 1500),
          solutions: jn.solutions.slice(0, 1500),
          lessonsLearned: jn.lessonsLearned.slice(0, 1500),
          nextSteps: jn.nextSteps.slice(0, 1000),
          evidenceSummary: jn.evidenceSummary.slice(0, 500),
          reviewStatus: jn.reviewStatus,
          teacherComment: jn.teacherComment.slice(0, 1500),
          teacherConfirmationNote: jn.teacherConfirmationNote.slice(0, 200),
          verifiedAt: jn.verifiedAt.slice(0, 100),
          version: jn.version,
          revisionHistory: jn.revisionHistory.slice(0, 20),
          authorUid: user.uid,
          authorName: jn.authorName.slice(0, 150),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'journals', jn.id), payload);
      }

      for (const ev of INITIAL_EVIDENCES) {
        const payload = {
          fileName: ev.fileName.slice(0, 250),
          description: ev.description.slice(0, 1500),
          evidenceType: ev.evidenceType,
          mimeType: ev.mimeType.slice(0, 120),
          fileSize: ev.fileSize,
          storageUrl: ev.storageUrl.slice(0, 2000),
          previewDataUrl: ev.previewDataUrl.slice(0, 350000),
          providerName: ev.providerName.slice(0, 150),
          collectionDate: ev.collectionDate.slice(0, 100),
          journalCode: ev.journalCode.slice(0, 40),
          stageNumber: ev.stageNumber,
          isApprovedForJury: ev.isApprovedForJury,
          isFeatured: ev.isFeatured,
          uploadedByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'evidences', ev.id), payload);
      }

      for (const ap of INITIAL_APPENDICES) {
        const payload = {
          appendixCode: ap.appendixCode.slice(0, 40),
          title: ap.title.slice(0, 300),
          description: ap.description.slice(0, 1500),
          responsiblePerson: ap.responsiblePerson.slice(0, 150),
          status: ap.status,
          fileName: ap.fileName.slice(0, 250),
          fileUrl: ap.fileUrl.slice(0, 2000),
          contentSummary: ap.contentSummary.slice(0, 4000),
          updatedLabel: ap.updatedLabel.slice(0, 60),
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'appendices', ap.id), payload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'initial_seed_sync');
    } finally {
      setIsSyncingSeed(false);
    }
  };

  const saveStage = async (stage: ResearchStage) => {
    if (!user) {
      throw new Error('Cần đăng nhập Firebase Authentication để lưu cấu trúc giai đoạn vào Firestore.');
    }
    const path = `stages/${stage.id}`;
    try {
      const payload = {
        stageNumber: stage.stageNumber,
        title: stage.title.trim().slice(0, 200),
        period: stage.period.trim().slice(0, 100),
        shortDescription: stage.shortDescription.trim().slice(0, 600),
        status: stage.status,
        activities: stage.activities.map((a) => a.trim()).filter(Boolean).slice(0, 20),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'stages', stage.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const createJournalEntry = async (
    entry: Omit<
      JournalEntry,
      'id' | 'version' | 'revisionHistory' | 'authorUid' | 'authorName' | 'createdAt' | 'updatedAt'
    >
  ) => {
    if (!user) {
      throw new Error('Cần đăng nhập tài khoản học sinh hoặc giáo viên qua Firebase Authentication để ghi nhật ký thật vào Firestore.');
    }
    const id = `journal-${Date.now()}`;
    const path = `journals/${id}`;
    const actorName = getRoleDisplayName(activeRole, user);
    const nowLabel = new Date().toLocaleDateString('vi-VN');
    try {
      const payload = {
        code: entry.code.trim().slice(0, 40),
        orderIndex: entry.orderIndex,
        stageNumber: entry.stageNumber,
        activityName: entry.activityName.trim().slice(0, 300),
        actualDateOrRange: entry.actualDateOrRange.trim().slice(0, 120),
        dateCertainty: entry.dateCertainty,
        dataOriginType: entry.dataOriginType,
        location: entry.location.trim().slice(0, 200),
        performer: entry.performer.trim().slice(0, 200),
        collaborators: (entry.collaborators || '').trim().slice(0, 200),
        objective: (entry.objective || '').trim().slice(0, 1000),
        workDone: entry.workDone.trim().slice(0, 3000),
        method: (entry.method || '').trim().slice(0, 1500),
        actualResult: (entry.actualResult || '').trim().slice(0, 1500),
        difficulties: (entry.difficulties || '').trim().slice(0, 1500),
        solutions: (entry.solutions || '').trim().slice(0, 1500),
        lessonsLearned: (entry.lessonsLearned || '').trim().slice(0, 1500),
        nextSteps: (entry.nextSteps || '').trim().slice(0, 1000),
        evidenceSummary: (entry.evidenceSummary || '').trim().slice(0, 500),
        reviewStatus: entry.reviewStatus,
        teacherComment: '',
        teacherConfirmationNote: '',
        verifiedAt: '',
        version: 1,
        revisionHistory: [`v1 (${nowLabel}) - Tạo mới bởi ${actorName}`],
        authorUid: user.uid,
        authorName: actorName.slice(0, 150),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'journals', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (!user) {
      throw new Error('Cần đăng nhập Firebase Authentication để cập nhật nhật ký.');
    }
    const existingEntry = journals.find((j) => j.id === id);
    if (!existingEntry) throw new Error('Không tìm thấy bản ghi nhật ký.');

    const actorName = getRoleDisplayName(activeRole, user);
    const nowLabel = new Date().toLocaleString('vi-VN');
    const nextEntry = buildNextJournalRevision(existingEntry, updates, actorName, nowLabel);

    const path = `journals/${id}`;
    try {
      const payload = {
        code: nextEntry.code.slice(0, 40),
        orderIndex: nextEntry.orderIndex,
        stageNumber: nextEntry.stageNumber,
        activityName: nextEntry.activityName.slice(0, 300),
        actualDateOrRange: nextEntry.actualDateOrRange.slice(0, 120),
        dateCertainty: nextEntry.dateCertainty,
        dataOriginType: nextEntry.dataOriginType,
        location: nextEntry.location.slice(0, 200),
        performer: nextEntry.performer.slice(0, 200),
        collaborators: nextEntry.collaborators.slice(0, 200),
        objective: nextEntry.objective.slice(0, 1000),
        workDone: nextEntry.workDone.slice(0, 3000),
        method: nextEntry.method.slice(0, 1500),
        actualResult: nextEntry.actualResult.slice(0, 1500),
        difficulties: nextEntry.difficulties.slice(0, 1500),
        solutions: nextEntry.solutions.slice(0, 1500),
        lessonsLearned: nextEntry.lessonsLearned.slice(0, 1500),
        nextSteps: nextEntry.nextSteps.slice(0, 1000),
        evidenceSummary: nextEntry.evidenceSummary.slice(0, 500),
        reviewStatus: nextEntry.reviewStatus,
        teacherComment: nextEntry.teacherComment.slice(0, 1500),
        teacherConfirmationNote: nextEntry.teacherConfirmationNote.slice(0, 200),
        verifiedAt: nextEntry.verifiedAt.slice(0, 100),
        version: nextEntry.version,
        revisionHistory: nextEntry.revisionHistory.slice(0, 20),
        authorUid: existingEntry.authorUid === 'seed-system' ? user.uid : existingEntry.authorUid,
        authorName: nextEntry.authorName.slice(0, 150),
        createdAt: existingEntry.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'journals', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const verifyJournalEntryAsTeacher = async (
    id: string,
    reviewStatus: 'verified' | 'revision_requested',
    teacherComment: string,
    teacherConfirmationNote: string
  ) => {
    if (!user) {
      throw new Error('Cần đăng nhập tài khoản Giáo viên hướng dẫn để xác nhận nhật ký.');
    }
    const existingEntry = journals.find((j) => j.id === id);
    if (!existingEntry) throw new Error('Không tìm thấy nhật ký.');

    const nowLabel = new Date().toLocaleDateString('vi-VN');
    const historyNote =
      reviewStatus === 'verified'
        ? `v${existingEntry.version} (${nowLabel}) - GV Vũ Thúy Mai xác nhận: ${teacherConfirmationNote || 'Đã duyệt'}`
        : `v${existingEntry.version} (${nowLabel}) - GV Vũ Thúy Mai yêu cầu chỉnh sửa: ${teacherComment}`;

    const path = `journals/${id}`;
    try {
      const payload = {
        code: existingEntry.code,
        orderIndex: existingEntry.orderIndex,
        stageNumber: existingEntry.stageNumber,
        activityName: existingEntry.activityName,
        actualDateOrRange: existingEntry.actualDateOrRange,
        dateCertainty: existingEntry.dateCertainty,
        dataOriginType: existingEntry.dataOriginType,
        location: existingEntry.location,
        performer: existingEntry.performer,
        collaborators: existingEntry.collaborators,
        objective: existingEntry.objective,
        workDone: existingEntry.workDone,
        method: existingEntry.method,
        actualResult: existingEntry.actualResult,
        difficulties: existingEntry.difficulties,
        solutions: existingEntry.solutions,
        lessonsLearned: existingEntry.lessonsLearned,
        nextSteps: existingEntry.nextSteps,
        evidenceSummary: existingEntry.evidenceSummary,
        reviewStatus,
        teacherComment: teacherComment.trim().slice(0, 1500),
        teacherConfirmationNote: teacherConfirmationNote.trim().slice(0, 200),
        verifiedAt: reviewStatus === 'verified' ? nowLabel : '',
        version: existingEntry.version,
        revisionHistory: [...existingEntry.revisionHistory, historyNote].slice(-20),
        authorUid: existingEntry.authorUid === 'seed-system' ? user.uid : existingEntry.authorUid,
        authorName: existingEntry.authorName,
        createdAt: existingEntry.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'journals', id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const uploadEvidenceFile = async (
    file: File | null,
    metadata: {
      fileName: string;
      description: string;
      evidenceType: EvidenceItem['evidenceType'];
      providerName: string;
      collectionDate: string;
      journalCode: string;
      stageNumber: number;
      manualStorageUrl?: string;
    },
    onProgress?: (percent: number) => void
  ) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập Firebase Authentication trước khi tải tệp minh chứng lên hệ thống.');
    }

    const evId = `ev-${Date.now()}`;
    let downloadUrl = metadata.manualStorageUrl || '';
    let previewDataUrl = '';
    const mimeType = file?.type || 'application/octet-stream';
    const fileSize = file?.size || 0;

    if (file) {
      onProgress?.(10);
      // Try reading small image preview (< 240KB) for instant fullscreen preview fallback
      if (file.type.startsWith('image/') && file.size <= 240 * 1024) {
        previewDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      // Upload to Firebase Cloud Storage
      try {
        const sRef = storageRef(storage, `evidences/${evId}_${file.name}`);
        const uploadTask = uploadBytesResumable(sRef, file);

        downloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              if (snapshot.totalBytes > 0) {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 85);
                onProgress?.(10 + pct);
              }
            },
            (err) => {
              reject(err);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      } catch (storageError) {
        // If Firebase Cloud Storage bucket is not yet initialized in the console or rules block it,
        // only fall back to inline data URL if it fits within Firestore limits (< 240KB); otherwise throw clear instruction.
        if (previewDataUrl) {
          downloadUrl = '';
          onProgress?.(90);
        } else if (file.size <= 220 * 1024) {
          previewDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
            reader.readAsDataURL(file);
          });
          onProgress?.(90);
        } else {
          throw new Error(
            `Không thể ghi tệp dung lượng lớn (${Math.round(file.size / 1024)} KB) lên Firebase Cloud Storage (${storageError instanceof Error ? storageError.message : 'Bucket chưa mở quyền Storage Rules'}). Vui lòng kích hoạt Firebase Storage Rules trong Firebase Console hoặc đính kèm tệp < 220KB / liên kết Google Drive minh chứng.`
          );
        }
      }
    }

    const path = `evidences/${evId}`;
    try {
      const isTeacher = activeRole === 'teacher_thuy_mai';
      const payload = {
        fileName: (metadata.fileName || file?.name || 'Minh_chung').trim().slice(0, 250),
        description: metadata.description.trim().slice(0, 1500),
        evidenceType: metadata.evidenceType,
        mimeType: mimeType.slice(0, 120),
        fileSize,
        storageUrl: downloadUrl.slice(0, 2000),
        previewDataUrl: previewDataUrl.slice(0, 350000),
        providerName: metadata.providerName.trim().slice(0, 150),
        collectionDate: metadata.collectionDate.trim().slice(0, 100),
        journalCode: metadata.journalCode.trim().slice(0, 40),
        stageNumber: metadata.stageNumber,
        isApprovedForJury: isTeacher,
        isFeatured: isTeacher,
        uploadedByUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'evidences', evId), payload);
      onProgress?.(100);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const toggleEvidenceApprovalAsTeacher = async (
    evidenceId: string,
    isApprovedForJury: boolean,
    isFeatured: boolean
  ) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập tài khoản Giáo viên hướng dẫn để duyệt minh chứng.');
    }
    const existingEv = evidences.find((e) => e.id === evidenceId);
    if (!existingEv) throw new Error('Không tìm thấy minh chứng.');

    const path = `evidences/${evidenceId}`;
    try {
      const payload = {
        fileName: existingEv.fileName,
        description: existingEv.description,
        evidenceType: existingEv.evidenceType,
        mimeType: existingEv.mimeType,
        fileSize: existingEv.fileSize,
        storageUrl: existingEv.storageUrl,
        previewDataUrl: existingEv.previewDataUrl,
        providerName: existingEv.providerName,
        collectionDate: existingEv.collectionDate,
        journalCode: existingEv.journalCode,
        stageNumber: existingEv.stageNumber,
        isApprovedForJury,
        isFeatured,
        uploadedByUid:
          existingEv.uploadedByUid === 'seed-system' ? user.uid : existingEv.uploadedByUid,
        createdAt: existingEv.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'evidences', evidenceId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteEvidenceItem = async (evidenceId: string) => {
    if (!user) {
      throw new Error('Cần đăng nhập để xóa minh chứng.');
    }
    const path = `evidences/${evidenceId}`;
    try {
      await deleteDoc(doc(db, 'evidences', evidenceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateAppendixDocument = async (appendix: AppendixDocument) => {
    if (!user) {
      throw new Error('Cần đăng nhập Firebase Authentication để cập nhật danh mục hồ sơ.');
    }
    const path = `appendices/${appendix.id}`;
    try {
      const payload = {
        appendixCode: appendix.appendixCode.slice(0, 40),
        title: appendix.title.trim().slice(0, 300),
        description: appendix.description.trim().slice(0, 1500),
        responsiblePerson: appendix.responsiblePerson.trim().slice(0, 150),
        status: appendix.status,
        fileName: appendix.fileName.trim().slice(0, 250),
        fileUrl: appendix.fileUrl.trim().slice(0, 2000),
        contentSummary: appendix.contentSummary.trim().slice(0, 4000),
        updatedLabel: new Date().toLocaleDateString('vi-VN'),
        updatedByUid: user.uid,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'appendices', appendix.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <ResearchContext.Provider
      value={{
        user,
        authReady,
        activeRole,
        setActiveRole,
        isConnectedToFirestore,
        isSyncingSeed,
        stages,
        journals,
        evidences,
        appendices,
        signInWithGoogle,
        signOut,
        syncInitialDossierToFirestore,
        saveStage,
        createJournalEntry,
        updateJournalEntry,
        verifyJournalEntryAsTeacher,
        uploadEvidenceFile,
        toggleEvidenceApprovalAsTeacher,
        deleteEvidenceItem,
        updateAppendixDocument,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export function useResearch() {
  const ctx = useContext(ResearchContext);
  if (!ctx) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return ctx;
}
