import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { users } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Mail, Phone, Calendar } from 'lucide-react';

export const AgentUsers = () => {
  const { user } = useAuth();
  const { responses } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Get users who have responses for this agent's provider
  const myResponses = responses.filter(r => r.insuranceProviderId === user?.insuranceProviderId);
  const myUserIds = new Set(myResponses.map(r => r.userId));
  const myUsers = users.filter(u => myUserIds.has(u.id));

  const filteredUsers = myUsers.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ clientUser }: { clientUser: typeof users[0] }) => {
    const userResponses = myResponses.filter(r => r.userId === clientUser.id);
    const hasSubmitted = userResponses.some(r => r.isSubmitted);
    const hasDraft = userResponses.some(r => !r.isSubmitted);
    const lastActivity = userResponses.reduce((latest, r) => {
      return new Date(r.updatedAt) > new Date(latest) ? r.updatedAt : latest;
    }, userResponses[0]?.updatedAt || '');

    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg mb-2">{clientUser.name}</h3>
            <div className="flex gap-2">
              {hasSubmitted && (
                <Badge className="bg-green-100 text-green-800">Submitted</Badge>
              )}
              {hasDraft && !hasSubmitted && (
                <Badge className="bg-orange-100 text-orange-800">Draft</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <a href={`mailto:${clientUser.email}`} className="hover:text-blue-600">
              {clientUser.email}
            </a>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <a href={`tel:${clientUser.phone}`} className="hover:text-blue-600">
              {clientUser.phone}
            </a>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            Last active: {new Date(lastActivity).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm text-gray-700">
            <strong>Responses:</strong> {userResponses.length} question(s) answered
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">My Clients</h1>
        <p className="text-gray-600">View and manage your client contacts</p>
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
          <CardTitle>Client Directory ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((clientUser) => (
                <UserCard key={clientUser.id} clientUser={clientUser} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
