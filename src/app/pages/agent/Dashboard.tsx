import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { users } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, CheckCircle, Clock, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const { providers, responses, questions, sections } = useData();

  const myProvider = providers.find(p => p.id === user?.insuranceProviderId);
  const myResponses = responses.filter(r => r.insuranceProviderId === user?.insuranceProviderId);
  const myUsers = users.filter(u => {
    // Find users who have responded to this provider's forms
    return myResponses.some(r => r.userId === u.id);
  });

  const draftResponses = myResponses.filter(r => !r.isSubmitted);
  const submittedResponses = myResponses.filter(r => r.isSubmitted);
  
  const uniqueDraftUsers = new Set(draftResponses.map(r => r.userId)).size;
  const uniqueSubmittedUsers = new Set(submittedResponses.map(r => r.userId)).size;

  const providerSections = sections.filter(s => s.insuranceProviderId === user?.insuranceProviderId);
  const providerQuestions = questions.filter(q => 
    providerSections.some(s => s.id === q.sectionId)
  );

  const chartData = [
    {
      name: 'Status',
      Draft: uniqueDraftUsers,
      Submitted: uniqueSubmittedUsers,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Agent Dashboard</h1>
        <p className="text-gray-600">
          {myProvider?.name} - Overview of your clients and responses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myUsers.length}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Questions</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{providerQuestions.length}</div>
            <p className="text-xs text-gray-500">In {providerSections.length} sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{uniqueSubmittedUsers}</div>
            <p className="text-xs text-gray-500">Completed forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{uniqueDraftUsers}</div>
            <p className="text-xs text-gray-500">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Response Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Submitted" fill="#10b981" />
                <Bar dataKey="Draft" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myResponses.slice(-5).reverse().map((response) => {
                const responseUser = users.find(u => u.id === response.userId);
                const question = providerQuestions.find(q => q.id === response.questionId);
                return (
                  <div key={response.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                    <div className={`mt-1 h-2 w-2 rounded-full ${response.isSubmitted ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{responseUser?.name}</strong> {response.isSubmitted ? 'submitted' : 'updated'} a response
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(response.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {myResponses.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No activity yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-900">
                💡 <strong>Follow up with draft users:</strong> Contact users who haven't completed their forms
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-green-900">
                ✅ <strong>Review submitted forms:</strong> Check completed submissions for accuracy
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-purple-900">
                📞 <strong>Use contact details:</strong> Access user phone and email from the Users page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
