import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const UserForm = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    providers,
    getSectionsByProvider,
    getQuestionsBySection,
    getResponsesByUser,
    saveResponse,
    submitResponses,
  } = useData();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const provider = providers.find(p => p.id === providerId);
  const sections = getSectionsByProvider(providerId || '');
  const currentSection = sections[currentSectionIndex];
  const questions = currentSection ? getQuestionsBySection(currentSection.id) : [];

  // Load existing responses
  useEffect(() => {
    if (user?.id && providerId) {
      const existingResponses = getResponsesByUser(user.id, providerId);
      const loadedAnswers: Record<string, string | string[]> = {};
      
      existingResponses.forEach(response => {
        loadedAnswers[response.questionId] = response.answer;
      });
      
      setAnswers(loadedAnswers);
      
      // Check if already submitted
      if (existingResponses.length > 0 && existingResponses.every(r => r.isSubmitted)) {
        setIsSubmitted(true);
      }
    }
  }, [user, providerId, getResponsesByUser]);

  // Auto-save with debounce
  useEffect(() => {
    if (user?.id && providerId && currentSection && Object.keys(answers).length > 0) {
      const timer = setTimeout(() => {
        Object.entries(answers).forEach(([questionId, answer]) => {
          saveResponse(user.id, providerId, currentSection.id, questionId, answer);
        });
        toast.success('Progress saved', { duration: 1000 });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [answers, user, providerId, currentSection, saveResponse]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, option] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(a => a !== option) };
      }
    });
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all required questions are answered
    const unansweredRequired = questions.filter(
      q => q.required && !answers[q.id]
    );

    if (unansweredRequired.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    if (window.confirm('Are you sure you want to submit? You cannot edit after submission.')) {
      if (user?.id && providerId) {
        submitResponses(user.id, providerId);
        setIsSubmitted(true);
        toast.success('Form submitted successfully!');
      }
    }
  };

  const progress = sections.length > 0 
    ? ((currentSectionIndex + 1) / sections.length) * 100 
    : 0;

  const renderQuestion = (question: typeof questions[0]) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={question.questionType}
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            disabled={isSubmitted}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows={4}
            disabled={isSubmitted}
            required={question.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter number"
            disabled={isSubmitted}
            required={question.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isSubmitted}
            required={question.required}
          />
        );

      case 'mcq':
        return (
          <RadioGroup
            value={(answer as string) || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            disabled={isSubmitted}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answer as string[] || []).includes(option)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(question.id, option, checked as boolean)
                  }
                  disabled={isSubmitted}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <Select
            value={(answer as string) || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            disabled={isSubmitted}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p>Provider not found</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl mb-4">Form Submitted Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for completing the {provider.name} questionnaire.
              Your responses have been recorded.
            </p>
            <Button onClick={() => navigate('/user')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/user')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">{provider.name}</h1>
            <p className="text-gray-600">Insurance Questionnaire</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Auto-save enabled
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Section {currentSectionIndex + 1} of {sections.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      {/* Current Section */}
      {currentSection && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentSection.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base">
                    {question.questionText}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentSectionIndex < sections.length - 1 ? (
            <Button onClick={handleNext}>
              Next Section
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Send className="mr-2 h-4 w-4" />
              Submit Form
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
