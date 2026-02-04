import { useState } from 'react';
import { users } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Mail, Phone, Building2 } from 'lucide-react';

export const AdminUsers = () => {
  const { providers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const allUsers = users.filter(u => u.role === 'user');
  const allAgents = users.filter(u => u.role === 'agent');

  const filteredUsers = allUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgents = allAgents.filter(
    agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ user }: { user: typeof users[0] }) => {
    const provider = user.insuranceProviderId 
      ? providers.find(p => p.id === user.insuranceProviderId)
      : null;

    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg mb-1">{user.name}</h3>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {user.phone}
          </div>
          {provider && (
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              {provider.name}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">User Management</h1>
        <p className="text-gray-600">View all users and agents in the system</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">
                Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="agents">
                Agents ({filteredAgents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No users found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="agents">
              {filteredAgents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No agents found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent) => (
                    <UserCard key={agent.id} user={agent} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
