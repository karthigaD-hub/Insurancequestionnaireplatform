import { useData } from '../../context/DataContext';
import { users } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const { providers, responses, getProviderStats } = useData();
  const stats = getProviderStats();

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalAgents = users.filter(u => u.role === 'agent').length;
  const totalResponses = responses.length;
  const submittedResponses = responses.filter(r => r.isSubmitted).length;
  const draftResponses = responses.filter(r => !r.isSubmitted).length;

  // Data for charts
  const providerData = stats.map(s => ({
    name: s.providerName.split(' ')[0], // Shorten names for chart
    Users: s.totalUsers,
    Submitted: s.submittedCount,
    Drafts: s.draftCount,
  }));

  const statusData = [
    { name: 'Submitted', value: submittedResponses },
    { name: 'Draft', value: draftResponses },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of the entire platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalUsers}</div>
            <p className="text-xs text-gray-500">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Insurance Agents</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalAgents}</div>
            <p className="text-xs text-gray-500">Across {providers.length} providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Submitted Forms</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{submittedResponses}</div>
            <p className="text-xs text-gray-500">Completed submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Draft Forms</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{draftResponses}</div>
            <p className="text-xs text-gray-500">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Users by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Users" fill="#3b82f6" />
                <Bar dataKey="Submitted" fill="#10b981" />
                <Bar dataKey="Drafts" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Provider</th>
                  <th className="text-left py-3 px-4">Total Users</th>
                  <th className="text-left py-3 px-4">Submitted</th>
                  <th className="text-left py-3 px-4">Drafts</th>
                  <th className="text-left py-3 px-4">Completion %</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.providerId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{stat.providerName}</td>
                    <td className="py-3 px-4">{stat.totalUsers}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        {stat.submittedCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">
                        {stat.draftCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stat.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{stat.completionPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
