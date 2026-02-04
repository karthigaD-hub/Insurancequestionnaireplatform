import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { users, questions as allQuestions, sections as allSections } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const AdminResponses = () => {
  const { providers, responses } = useData();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const providerResponses = selectedProviderId
    ? responses.filter(r => r.insuranceProviderId === selectedProviderId)
    : [];

  const draftResponses = providerResponses.filter(r => !r.isSubmitted);
  const submittedResponses = providerResponses.filter(r => r.isSubmitted);

  // Group responses by user
  const groupedResponses = providerResponses.reduce((acc, response) => {
    const userId = response.userId;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(response);
    return acc;
  }, {} as Record<string, typeof providerResponses>);

  const handleExport = () => {
    toast.success('Responses exported successfully');
  };

  const ResponseCard = ({ userId, userResponses }: { userId: string; userResponses: typeof providerResponses }) => {
    const user = users.find(u => u.id === userId);
    const isSubmitted = userResponses.every(r => r.isSubmitted);
    const lastUpdated = userResponses.reduce((latest, r) => {
      return new Date(r.updatedAt) > new Date(latest) ? r.updatedAt : latest;
    }, userResponses[0]?.updatedAt || '');

    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg mb-1">{user?.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{user?.email}</p>
              <p>{user?.phone}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {isSubmitted ? (
              <Badge className="bg-green-100 text-green-800">Submitted</Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800">Draft</Badge>
            )}
            <p className="text-xs text-gray-500">
              {new Date(lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 space-y-2">
          <p className="text-sm mb-2">
            <strong>Responses: </strong>
            {userResponses.length} question(s) answered
          </p>
          {userResponses.slice(0, 3).map((response) => {
            const question = allQuestions.find(q => q.id === response.questionId);
            return (
              <div key={response.id} className="text-sm">
                <p className="text-gray-700">{question?.questionText}</p>
                <p className="text-gray-900 mt-1">
                  {Array.isArray(response.answer) 
                    ? response.answer.join(', ') 
                    : response.answer}
                </p>
              </div>
            );
          })}
          {userResponses.length > 3 && (
            <p className="text-sm text-gray-500">
              +{userResponses.length - 3} more responses
            </p>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Response Management</h1>
        <p className="text-gray-600">View and manage form responses</p>
      </div>

      {/* Provider Selection */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter by Provider</CardTitle>
          <Button onClick={handleExport} disabled={!selectedProviderId}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a provider" />
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
        <Card>
          <CardHeader>
            <CardTitle>Responses for {selectedProvider.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({Object.keys(groupedResponses).length})
                </TabsTrigger>
                <TabsTrigger value="submitted">
                  Submitted ({new Set(submittedResponses.map(r => r.userId)).size})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Drafts ({new Set(draftResponses.map(r => r.userId)).size})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {Object.keys(groupedResponses).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No responses yet for this provider
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupedResponses).map(([userId, userResponses]) => (
                      <ResponseCard
                        key={userId}
                        userId={userId}
                        userResponses={userResponses}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submitted">
                {submittedResponses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No submitted responses yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupedResponses)
                      .filter(([_, userResponses]) => userResponses.every(r => r.isSubmitted))
                      .map(([userId, userResponses]) => (
                        <ResponseCard
                          key={userId}
                          userId={userId}
                          userResponses={userResponses}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="draft">
                {draftResponses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No draft responses
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupedResponses)
                      .filter(([_, userResponses]) => userResponses.some(r => !r.isSubmitted))
                      .map(([userId, userResponses]) => (
                        <ResponseCard
                          key={userId}
                          userId={userId}
                          userResponses={userResponses}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
