import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowRight, CheckCircle, Clock, FileText } from 'lucide-react';

export const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProvidersWithQuestions, responses } = useData();

  const availableProviders = getProvidersWithQuestions();
  const myResponses = responses.filter(r => r.userId === user?.id);

  // Group responses by provider
  const responsesByProvider = myResponses.reduce((acc, response) => {
    const providerId = response.insuranceProviderId;
    if (!acc[providerId]) {
      acc[providerId] = [];
    }
    acc[providerId].push(response);
    return acc;
  }, {} as Record<string, typeof myResponses>);

  const getProviderStatus = (providerId: string) => {
    const providerResponses = responsesByProvider[providerId] || [];
    if (providerResponses.length === 0) {
      return { status: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    }
    const allSubmitted = providerResponses.every(r => r.isSubmitted);
    if (allSubmitted) {
      return { status: 'submitted', label: 'Submitted', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'draft', label: 'In Progress', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Select an insurance provider to fill out their questionnaire</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available Forms</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{availableProviders.length}</div>
            <p className="text-xs text-gray-500">Insurance providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {Object.values(responsesByProvider).filter(
                responses => responses.some(r => !r.isSubmitted)
              ).length}
            </div>
            <p className="text-xs text-gray-500">Draft forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {Object.values(responsesByProvider).filter(
                responses => responses.every(r => r.isSubmitted)
              ).length}
            </div>
            <p className="text-xs text-gray-500">Submitted forms</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Cards */}
      <div className="mb-8">
        <h2 className="text-xl mb-4">Insurance Providers</h2>
        {availableProviders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-gray-500 text-center">
                No questionnaires available at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProviders.map((provider) => {
              const status = getProviderStatus(provider.id);
              return (
                <Card
                  key={provider.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/user/form/${provider.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <img
                        src={provider.logoUrl}
                        alt={provider.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {status.status === 'submitted' && 'Your form has been submitted successfully'}
                      {status.status === 'draft' && 'Continue filling out your application'}
                      {status.status === 'not-started' && 'Start your insurance application'}
                    </p>
                    <Button className="w-full" variant={status.status === 'submitted' ? 'outline' : 'default'}>
                      {status.status === 'submitted' ? 'View Submission' : 'Continue'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 rounded-full p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="mb-1">How it works</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Select an insurance provider to view their questionnaire</li>
                <li>• Your progress is automatically saved as you type</li>
                <li>• You can exit and resume anytime - your answers are preserved</li>
                <li>• Submit when you're ready - you can review before final submission</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
