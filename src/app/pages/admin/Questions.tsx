import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { QuestionType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export const AdminQuestions = () => {
  const {
    providers,
    sections,
    getSectionsByProvider,
    addSection,
    deleteSection,
    questions,
    getQuestionsBySection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useData();

  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  
  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [isRequired, setIsRequired] = useState(true);
  const [options, setOptions] = useState<string[]>(['']);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const providerSections = selectedProviderId ? getSectionsByProvider(selectedProviderId) : [];

  const handleAddSection = () => {
    if (!selectedProviderId || !newSectionTitle.trim()) {
      toast.error('Please select a provider and enter section title');
      return;
    }
    addSection(selectedProviderId, newSectionTitle);
    setNewSectionTitle('');
    setShowSectionDialog(false);
    toast.success('Section added successfully');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure? This will delete all questions in this section.')) {
      deleteSection(sectionId);
      toast.success('Section deleted');
    }
  };

  const handleAddQuestion = () => {
    if (!selectedSectionId || !questionText.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const needsOptions = ['mcq', 'checkbox', 'dropdown'].includes(questionType);
    const validOptions = options.filter(opt => opt.trim());
    
    if (needsOptions && validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    addQuestion(
      selectedSectionId,
      questionText,
      questionType,
      isRequired,
      needsOptions ? validOptions : undefined
    );

    // Reset form
    setQuestionText('');
    setQuestionType('text');
    setIsRequired(true);
    setOptions(['']);
    setShowQuestionDialog(false);
    toast.success('Question added successfully');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId);
      toast.success('Question deleted');
    }
  };

  const addOptionField = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const questionTypeOptions: { value: QuestionType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Question Management</h1>
        <p className="text-gray-600">Create and manage questionnaire sections and questions</p>
      </div>

      {/* Provider Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Insurance Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a provider to manage questions" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProvider && (
        <>
          {/* Sections Management */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections for {selectedProvider.name}</CardTitle>
              <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>
                      Create a new section for {selectedProvider.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="section-title">Section Title</Label>
                      <Input
                        id="section-title"
                        placeholder="e.g., Personal Details"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSection}>Add Section</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {providerSections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No sections yet. Click "Add Section" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {providerSections.map((section) => {
                    const sectionQuestions = getQuestionsBySection(section.id);
                    return (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="text-lg">{section.title}</h3>
                              <p className="text-sm text-gray-500">
                                {sectionQuestions.length} question(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSectionId(section.id);
                                setShowQuestionDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Question
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Questions List */}
                        {sectionQuestions.length > 0 && (
                          <div className="space-y-2 ml-8">
                            {sectionQuestions.map((question) => (
                              <div
                                key={question.id}
                                className="flex items-start justify-between bg-gray-50 p-3 rounded"
                              >
                                <div className="flex-1">
                                  <p className="mb-1">{question.questionText}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{question.questionType}</Badge>
                                    {question.required && (
                                      <Badge variant="destructive">Required</Badge>
                                    )}
                                    {question.options && (
                                      <Badge variant="secondary">
                                        {question.options.length} options
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Question Dialog */}
          <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Create a new question for the selected section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question-text">Question Text *</Label>
                  <Textarea
                    id="question-text"
                    placeholder="Enter your question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-type">Question Type *</Label>
                  <Select value={questionType} onValueChange={(value) => setQuestionType(value as QuestionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={isRequired}
                    onCheckedChange={(checked) => setIsRequired(checked as boolean)}
                  />
                  <Label htmlFor="required">Required field</Label>
                </div>

                {['mcq', 'checkbox', 'dropdown'].includes(questionType) && (
                  <div className="space-y-2">
                    <Label>Options *</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                        {options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addOptionField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
