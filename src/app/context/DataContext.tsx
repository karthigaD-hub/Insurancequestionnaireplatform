import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  InsuranceProvider,
  Section,
  Question,
  Response,
  QuestionType,
} from '../types';
import {
  insuranceProviders as mockProviders,
  sections as mockSections,
  questions as mockQuestions,
  responses as mockResponses,
} from '../data/mockData';

interface DataContextType {
  // Providers
  providers: InsuranceProvider[];
  getProvidersWithQuestions: () => InsuranceProvider[];
  
  // Sections
  sections: Section[];
  getSectionsByProvider: (providerId: string) => Section[];
  addSection: (providerId: string, title: string) => Section;
  deleteSection: (sectionId: string) => void;
  
  // Questions
  questions: Question[];
  getQuestionsBySection: (sectionId: string) => Question[];
  getQuestionsByProvider: (providerId: string) => Question[];
  addQuestion: (
    sectionId: string,
    questionText: string,
    questionType: QuestionType,
    required: boolean,
    options?: string[]
  ) => Question;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  
  // Responses
  responses: Response[];
  getResponsesByUser: (userId: string, providerId: string) => Response[];
  getResponsesByProvider: (providerId: string) => Response[];
  saveResponse: (
    userId: string,
    providerId: string,
    sectionId: string,
    questionId: string,
    answer: string | string[]
  ) => void;
  submitResponses: (userId: string, providerId: string) => void;
  
  // Stats
  getProviderStats: () => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providers] = useState<InsuranceProvider[]>(mockProviders);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [responses, setResponses] = useState<Response[]>([]);

  // Load responses from localStorage on mount
  useEffect(() => {
    const storedResponses = localStorage.getItem('xcyber_responses');
    if (storedResponses) {
      setResponses(JSON.parse(storedResponses));
    } else {
      setResponses(mockResponses);
    }
  }, []);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('xcyber_responses', JSON.stringify(responses));
  }, [responses]);

  const getProvidersWithQuestions = () => {
    const providerIds = new Set(sections.map(s => s.insuranceProviderId));
    return providers.filter(p => providerIds.has(p.id));
  };

  const getSectionsByProvider = (providerId: string) => {
    return sections
      .filter(s => s.insuranceProviderId === providerId)
      .sort((a, b) => a.order - b.order);
  };

  const addSection = (providerId: string, title: string) => {
    const existingSections = getSectionsByProvider(providerId);
    const newSection: Section = {
      id: `section-${Date.now()}`,
      insuranceProviderId: providerId,
      title,
      order: existingSections.length + 1,
      createdAt: new Date().toISOString(),
    };
    setSections([...sections, newSection]);
    return newSection;
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    setQuestions(questions.filter(q => q.sectionId !== sectionId));
    setResponses(responses.filter(r => r.sectionId !== sectionId));
  };

  const getQuestionsBySection = (sectionId: string) => {
    return questions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  const getQuestionsByProvider = (providerId: string) => {
    const providerSections = getSectionsByProvider(providerId);
    const sectionIds = providerSections.map(s => s.id);
    return questions.filter(q => sectionIds.includes(q.sectionId));
  };

  const addQuestion = (
    sectionId: string,
    questionText: string,
    questionType: QuestionType,
    required: boolean,
    options?: string[]
  ) => {
    const existingQuestions = getQuestionsBySection(sectionId);
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      sectionId,
      questionText,
      questionType,
      options,
      required,
      order: existingQuestions.length + 1,
      createdAt: new Date().toISOString(),
    };
    setQuestions([...questions, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    setResponses(responses.filter(r => r.questionId !== questionId));
  };

  const getResponsesByUser = (userId: string, providerId: string) => {
    return responses.filter(
      r => r.userId === userId && r.insuranceProviderId === providerId
    );
  };

  const getResponsesByProvider = (providerId: string) => {
    return responses.filter(r => r.insuranceProviderId === providerId);
  };

  const saveResponse = (
    userId: string,
    providerId: string,
    sectionId: string,
    questionId: string,
    answer: string | string[]
  ) => {
    const existingResponse = responses.find(
      r => r.userId === userId && r.questionId === questionId
    );

    if (existingResponse) {
      // Update existing response
      setResponses(responses.map(r =>
        r.id === existingResponse.id
          ? { ...r, answer, updatedAt: new Date().toISOString() }
          : r
      ));
    } else {
      // Create new response
      const newResponse: Response = {
        id: `res-${Date.now()}-${Math.random()}`,
        userId,
        insuranceProviderId: providerId,
        sectionId,
        questionId,
        answer,
        isSubmitted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResponses([...responses, newResponse]);
    }
  };

  const submitResponses = (userId: string, providerId: string) => {
    setResponses(responses.map(r =>
      r.userId === userId && r.insuranceProviderId === providerId
        ? { ...r, isSubmitted: true, updatedAt: new Date().toISOString() }
        : r
    ));
  };

  const getProviderStats = () => {
    return providers.map(provider => {
      const providerResponses = responses.filter(
        r => r.insuranceProviderId === provider.id
      );
      
      const userIds = new Set(providerResponses.map(r => r.userId));
      const totalUsers = userIds.size;
      
      const submittedUsers = new Set(
        providerResponses.filter(r => r.isSubmitted).map(r => r.userId)
      );
      const draftUsers = new Set(
        providerResponses.filter(r => !r.isSubmitted).map(r => r.userId)
      );
      
      return {
        providerId: provider.id,
        providerName: provider.name,
        totalUsers,
        draftCount: draftUsers.size,
        submittedCount: submittedUsers.size,
        completionPercentage: totalUsers > 0 
          ? Math.round((submittedUsers.size / totalUsers) * 100)
          : 0,
      };
    });
  };

  return (
    <DataContext.Provider
      value={{
        providers,
        getProvidersWithQuestions,
        sections,
        getSectionsByProvider,
        addSection,
        deleteSection,
        questions,
        getQuestionsBySection,
        getQuestionsByProvider,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        responses,
        getResponsesByUser,
        getResponsesByProvider,
        saveResponse,
        submitResponses,
        getProviderStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
