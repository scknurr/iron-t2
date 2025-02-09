import React, { useState, useMemo, createContext, useContext } from 'react';

// Canvas Kit imports
import {
  PrimaryButton,
  SecondaryButton,
  DeleteButton
} from '@workday/canvas-kit-react/button';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { TextInput } from '@workday/canvas-kit-react/text-input';
import { Select } from '@workday/canvas-kit-react/select';
import { Avatar } from '@workday/canvas-kit-react/avatar';
import { Text } from '@workday/canvas-kit-react/text';

import './styles.css'; // Keep your layout/styles or convert them to Canvas tokens if you prefer

/* ------------------ Context & Data Generation ------------------ */

const AppContext = createContext();

function AppProvider({ children }) {
  const initialData = useMemo(() => {
    const data = generateFakeData();
    // For debugging, limit activityFeed to 20 entries.
    data.activityFeed = data.activityFeed.slice(0, 20);
    return data;
  }, []);

  const [humans, setHumans] = useState(() => initialData.humans);
  const [skills, setSkills] = useState(() => initialData.skills);
  const [customers, setCustomers] = useState(() => initialData.customers);
  const [activityFeed, setActivityFeed] = useState(() => initialData.activityFeed);

  return (
    <AppContext.Provider
      value={{
        humans,
        setHumans,
        skills,
        setSkills,
        customers,
        setCustomers,
        activityFeed,
        setActivityFeed
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  return useContext(AppContext);
}

/* ------------------ Fake Data Generation ------------------ */

function generateFakeData() {
  const humans = [
    {
      id: 'H001',
      name: 'Dr. Amelia Rios',
      headline: 'Pediatric Surgeon',
      profilePhotoUrl: 'https://via.placeholder.com/40',
      skills: [{ skillId: 'S010', rating: 5 }],
      presenceStatus: 'online'
    },
    {
      id: 'H002',
      name: 'Jason Patel',
      headline: 'ICU Nurse',
      profilePhotoUrl: 'https://via.placeholder.com/40',
      skills: [{ skillId: 'S011', rating: 4 }],
      presenceStatus: 'idle'
    },
    {
      id: 'H003',
      name: 'Morgan Lee',
      headline: 'Medical Technologist',
      profilePhotoUrl: 'https://via.placeholder.com/40',
      skills: [{ skillId: 'S012', rating: 3 }],
      presenceStatus: 'offline'
    }
  ];

  const skills = [
    {
      id: 'S010',
      name: 'EHR Optimization – Epic',
      description: 'Streamline electronic health record workflows.',
      category: 'Clinical Informatics',
      popularityScore: 90,
      endorsements: [{ endorserId: 'H002', comment: 'Revolutionary!' }],
      humans: ['H001'],
      customers: ['C001'],
      parentSkillId: null,
      siblingSkills: ['S011']
    },
    {
      id: 'S011',
      name: 'IV Insertion',
      description: 'Efficient and safe IV insertion techniques.',
      category: 'Infusion Therapy',
      popularityScore: 75,
      endorsements: [{ endorserId: 'H003', comment: 'Very reliable' }],
      humans: ['H002'],
      customers: ['C001'],
      parentSkillId: 'S010',
      siblingSkills: ['S012']
    },
    {
      id: 'S012',
      name: 'Sedation Management',
      description: 'Safe sedation protocols and monitoring.',
      category: 'Critical Care',
      popularityScore: 65,
      endorsements: [],
      humans: ['H003'],
      customers: ['C002'],
      parentSkillId: null,
      siblingSkills: []
    }
  ];

  const customers = [
    {
      id: 'C001',
      name: 'Mercy Health Springfield',
      facilityType: 'Hospital',
      ownershipType: 'Private',
      ehrSystem: 'Epic',
      traumaCenterLevel: 'Level I',
      humans: ['H001', 'H002'],
      skills: ['S010', 'S011'],
      bedCount: 250
    },
    {
      id: 'C002',
      name: 'St. Jude Medical Center',
      facilityType: 'Medical Center',
      ownershipType: 'Nonprofit',
      ehrSystem: 'Cerner',
      traumaCenterLevel: 'Level II',
      humans: ['H003'],
      skills: ['S012'],
      bedCount: 150
    }
  ];

  const now = Math.floor(Date.now() / 1000);
  const activityFeed = Array.from({ length: 20 }, (_, i) => ({
    id: `ACT${i.toString().padStart(3, '0')}`,
    timestamp: now - i * 300,
    actorId: humans[Math.floor(Math.random() * humans.length)].id,
    actorName: humans[Math.floor(Math.random() * humans.length)].name,
    entityType: ['CUSTOMER', 'SKILL', 'SEARCH'][
      Math.floor(Math.random() * 3)
    ],
    entityId: customers[Math.floor(Math.random() * customers.length)].id,
    entityName: customers[Math.floor(Math.random() * customers.length)].name,
    dataField: i % 3 === 0 ? 'merge' : 'rating',
    oldValue: i % 3 === 0 ? 'N/A' : Math.floor(Math.random() * 5),
    newValue: i % 3 === 0 ? 'Merged' : Math.floor(Math.random() * 5) + 1,
    comment: i % 3 === 0 ? 'Merged duplicate entries' : 'Updated rating'
  }));

  return { humans, skills, customers, activityFeed };
}

/* ------------------ SearchBar Component (Canvas) ------------------ */

function SearchBar({ onSearch }) {
  const { setActivityFeed } = useAppContext();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    setActivityFeed(prev => [
      ...prev,
      {
        id: `SEARCH-${Date.now()}`,
        timestamp: Math.floor(Date.now() / 1000),
        entityType: 'SEARCH',
        comment: query
      }
    ]);
    onSearch(query);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <FormField>
        <TextInput
          placeholder="Search skills, people, hospitals..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </FormField>
      <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
    </div>
  );
}

/* ------------------ SkillGraph Component (Canvas Buttons) ------------------ */

function SkillGraph({ skill }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="skill-graph">
      <SecondaryButton onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Adjacency' : 'Show Adjacency'}
      </SecondaryButton>
      {expanded && (
        <ul>
          {skill.parentSkillId && (
            <li>
              <Text as="span" weight="medium">
                Parent:
              </Text>{' '}
              {skill.parentSkillId}
            </li>
          )}
          {skill.siblingSkills && skill.siblingSkills.length > 0 && (
            <li>
              <Text as="span" weight="medium">
                Siblings:
              </Text>{' '}
              {skill.siblingSkills.join(', ')}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/* ------------------ Profile & Card Components ------------------ */

function HumanProfile({ human, onNavigate }) {
  return (
    <div className="profile-grid">
      <div className="profile-sidebar">
        <Avatar size="l" altText={human.name} src={human.profilePhotoUrl} />
        <Text as="h2">{human.name}</Text>
        <Text as="p">{human.headline}</Text>
        <Text as="p" className="presence-status">
          {human.presenceStatus}
        </Text>
        <SecondaryButton onClick={() => alert('Editing profile')}>
          Edit Profile
        </SecondaryButton>
      </div>
      <div className="profile-content">
        <Text as="h3">Skills &amp; Expertise</Text>
        {human.skills.map(skill => (
          <SkillCard
            key={skill.skillId}
            skillId={skill.skillId}
            rating={skill.rating}
            onNavigate={onNavigate}
          />
        ))}
        <Text as="h3">Recent Activity</Text>
        <ActivityLog entityType="HUMAN" entityId={human.id} />
      </div>
    </div>
  );
}

function CustomerProfile({ customer, onNavigate }) {
  return (
    <div className="profile-grid">
      <div className="profile-sidebar">
        <Text as="h2">{customer.name}</Text>
        <Text as="p">
          {customer.facilityType} - {customer.ownershipType}
        </Text>
        <Text as="p">EHR: {customer.ehrSystem}</Text>
        <Text as="p">Trauma: {customer.traumaCenterLevel}</Text>
      </div>
      <div className="profile-content">
        <Text as="h3">Staff</Text>
        {customer.humans.map(humanId => (
          <HumanCard key={humanId} humanId={humanId} onNavigate={onNavigate} />
        ))}
        <Text as="h3">Key Skills in Use</Text>
        {customer.skills.map(skillId => (
          <SkillCard key={skillId} skillId={skillId} onNavigate={onNavigate} />
        ))}
        <Text as="h3">Recent Updates</Text>
        <ActivityLog entityType="CUSTOMER" entityId={customer.id} />
      </div>
    </div>
  );
}

function SkillProfile({ skill, onNavigate }) {
  return (
    <div className="profile-grid">
      <div className="profile-sidebar">
        <Text as="h2">{skill.name}</Text>
        <Text as="p">{skill.description}</Text>
        <Text as="p" className="category">
          {skill.category}
        </Text>
      </div>
      <div className="profile-content">
        <Text as="h3">Endorsements</Text>
        {skill.endorsements.map(endorsement => (
          <Text as="p" key={endorsement.endorserId}>
            {endorsement.comment} - {endorsement.endorserId}
          </Text>
        ))}
        <Text as="h3">Who Uses This Skill?</Text>
        {skill.humans.map(humanId => (
          <HumanCard key={humanId} humanId={humanId} onNavigate={onNavigate} />
        ))}
        <Text as="h3">Where Is This Skill Applied?</Text>
        {skill.customers &&
          skill.customers.map(customerId => (
            <CustomerCard
              key={customerId}
              customerId={customerId}
              onNavigate={onNavigate}
            />
          ))}
      </div>
    </div>
  );
}

/* ------------------ Card Components ------------------ */

function HumanCard({ humanId, onNavigate }) {
  const { humans } = useAppContext();
  const human = humans.find(h => h.id === humanId);
  if (!human) return null;
  return (
    <div
      className="card human-card"
      onClick={e => {
        e.preventDefault();
        onNavigate('entity', {
          type: 'human',
          id: human.id,
          name: human.name
        });
      }}
    >
      <Text as="p">{human.name}</Text>
    </div>
  );
}

function CustomerCard({ customerId, onNavigate }) {
  const { customers } = useAppContext();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;
  return (
    <div
      className="card customer-card"
      onClick={e => {
        e.preventDefault();
        onNavigate('entity', {
          type: 'customer',
          id: customer.id,
          name: customer.name
        });
      }}
    >
      <Text as="p">{customer.name}</Text>
    </div>
  );
}

function SkillCard({ skillId, rating, onNavigate }) {
  const { skills } = useAppContext();
  const skill = skills.find(s => s.id === skillId);
  if (!skill) return null;
  return (
    <div className="skill-card">
      <Text as="h4">
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onNavigate('entity', {
              type: 'skill',
              id: skill.id,
              name: skill.name
            });
          }}
        >
          {skill.name}
        </a>
      </Text>
      {rating && <Text as="p">Rating: {rating}</Text>}
      <SkillGraph skill={skill} />
    </div>
  );
}

/* ------------------ ActivityLog Component ------------------ */

function ActivityLog({ entityType, entityId }) {
  const { activityFeed } = useAppContext();
  const filteredFeed = activityFeed.filter(
    item =>
      item.entityType &&
      item.entityType.toUpperCase() === entityType &&
      item.dataField &&
      item.dataField.toLowerCase() === 'merge'
        ? false
        : true
  );
  // Alternatively, if you only want to show items matching the type:
  // const filteredFeed = activityFeed.filter(
  //   item => item.entityType && item.entityType.toUpperCase() === entityType
  // );

  return (
    <div className="activity-log">
      {filteredFeed.length === 0 ? (
        <Text as="p">No recent activity.</Text>
      ) : (
        filteredFeed.map(item => (
          <Text as="p" key={item.id}>
            {item.comment} (at{' '}
            {new Date(item.timestamp * 1000).toLocaleString()})
          </Text>
        ))
      )}
    </div>
  );
}

/* ------------------ EntityPage Component ------------------ */

function EntityPage({ entity, onNavigate }) {
  const { humans, customers, skills } = useAppContext();
  if (!entity) return <Text as="p">Loading...</Text>;
  if (entity.type === 'human') {
    const fullEntity = humans.find(h => h.id === entity.id);
    return fullEntity ? (
      <HumanProfile human={fullEntity} onNavigate={onNavigate} />
    ) : (
      <Text as="p">Human not found</Text>
    );
  } else if (entity.type === 'customer') {
    const fullEntity = customers.find(c => c.id === entity.id);
    return fullEntity ? (
      <CustomerProfile customer={fullEntity} onNavigate={onNavigate} />
    ) : (
      <Text as="p">Customer not found</Text>
    );
  } else if (entity.type === 'skill') {
    const fullEntity = skills.find(s => s.id === entity.id);
    return fullEntity ? (
      <SkillProfile skill={fullEntity} onNavigate={onNavigate} />
    ) : (
      <Text as="p">Skill not found</Text>
    );
  } else {
    return <Text as="p">Unknown entity type</Text>;
  }
}

/* ------------------ InterviewPage Component (Canvas) ------------------ */

function InterviewPage({ onNavigate }) {
  const { humans, skills } = useAppContext();
  const [step, setStep] = useState(1);
  const [selectedHuman, setSelectedHuman] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [rating, setRating] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (selectedHuman && selectedSkill) {
      alert(
        `Interview submitted: Assigned skill ${selectedSkill} with rating ${rating} to human ${selectedHuman}`
      );
      setStep(1);
      setSelectedHuman('');
      setSelectedSkill('');
      setRating(1);
      onNavigate('home');
    } else {
      alert('Please select a human and a skill.');
    }
  };

  return (
    <div className="page">
      <Text as="h2">Interview Workflow</Text>
      {step === 1 && (
        <div className="interview-step">
          <FormField label="Select a Human (User):">
            <Select
              onChange={e => setSelectedHuman(e.target.value)}
              value={selectedHuman}
            >
              <option value="">--Choose a Human--</option>
              {humans.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div style={{ marginTop: '1rem' }}>
            <SecondaryButton onClick={handleNext}>Next</SecondaryButton>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="interview-step">
          <FormField label="Select a Skill:">
            <Select
              onChange={e => setSelectedSkill(e.target.value)}
              value={selectedSkill}
            >
              <option value="">--Choose a Skill--</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </Select>
          </FormField>
          <div style={{ marginTop: '1rem' }}>
            <SecondaryButton onClick={handleBack} style={{ marginRight: 8 }}>
              Back
            </SecondaryButton>
            <SecondaryButton onClick={handleNext}>Next</SecondaryButton>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="interview-step">
          <FormField label="Assign Skill Rating (1-5):">
            <TextInput
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
            />
          </FormField>
          <div style={{ marginTop: '1rem' }}>
            <SecondaryButton onClick={handleBack} style={{ marginRight: 8 }}>
              Back
            </SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ Header Component (Simplified Canvas) ------------------ */

function Header() {
  return (
    <header className="canvas-header">
      <Text as="h1">Iron Triangle BI</Text>
      <div style={{ width: 300 }}>
        <TextInput placeholder="Search skills, people, hospitals..." />
      </div>
      <div className="user-menu">
        <Avatar size="s" altText="User" src="https://via.placeholder.com/40" />
        {/* For presence, you could use a StatusIndicator (Labs) or a small dot icon */}
        <span className="presence-indicator online"></span>
      </div>
    </header>
  );
}

/* ------------------ Navigation (Canvas Buttons) ------------------ */

function Navigation({ currentPage, onNavigate }) {
  const pages = [
    { key: 'home', label: 'Home' },
    { key: 'humans', label: 'Humans' },
    { key: 'skills', label: 'Skills' },
    { key: 'customers', label: 'Customers' },
    { key: 'interview', label: 'Interview' }
  ];
  return (
    <nav className="canvas-navbar">
      {pages.map(page => (
        <SecondaryButton
          key={page.key}
          onClick={() => onNavigate(page.key)}
          style={{
            marginRight: '8px',
            ...(currentPage === page.key ? { backgroundColor: '#EDFAFF' } : {})
          }}
        >
          {page.label}
        </SecondaryButton>
      ))}
    </nav>
  );
}

/* ------------------ HomePage ------------------ */

function HomePage({ onNavigate }) {
  return (
    <div className="main-content">
      <div style={{ flex: '1' }}>
        <SearchBar onSearch={query => console.log('Search query:', query)} />
        <IndicatorsPanel />
        <ActivityFeed onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ------------------ IndicatorsPanel Component ------------------ */

function IndicatorsPanel() {
  const { activityFeed, skills } = useAppContext();
  const totalActivities = activityFeed.length;
  const totalMerges = activityFeed.filter(
    item => item.dataField && item.dataField.toLowerCase() === 'merge'
  ).length;
  const searchItems = activityFeed.filter(
    item => item.entityType && item.entityType.toUpperCase() === 'SEARCH'
  ).length;
  return (
    <div className="indicators-panel">
      <Text as="p">Total Activity: {totalActivities}</Text>
      <Text as="p">Merges: {totalMerges}</Text>
      <Text as="p">Searches: {searchItems}</Text>
      <Text as="p">Total Skills: {skills.length}</Text>
    </div>
  );
}

/* ------------------ ActivityFeed Component (for HomePage) ------------------ */

function ActivityFeed({ onNavigate }) {
  const { activityFeed } = useAppContext();
  return (
    <div className="activity-feed">
      <Text as="h3">Global Activity Feed</Text>
      {activityFeed.map(item => (
        <div
          key={item.id}
          className="activity-item"
          onClick={() =>
            onNavigate('entity', {
              type: item.entityType ? item.entityType.toLowerCase() : '',
              id: item.entityId,
              name: item.entityName
            })
          }
        >
          <Text as="p">
            [{new Date(item.timestamp * 1000).toLocaleTimeString()}] {item.comment}
          </Text>
        </div>
      ))}
    </div>
  );
}

/* ------------------ EntityPage Component ------------------ */
// (See earlier definition; unchanged)

/* ------------------ Main App Component ------------------ */

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentEntity, setCurrentEntity] = useState(null);

  const handleNavigate = (pageOrType, payload) => {
    if (pageOrType === 'entity') {
      setCurrentEntity(payload);
      setCurrentPage('entity');
    } else {
      setCurrentPage(pageOrType);
      setCurrentEntity(null);
    }
  };

  let ContentComponent;
  if (currentPage === 'home') {
    ContentComponent = HomePage;
  } else if (currentPage === 'humans') {
    ContentComponent = () => (
      <div>
        <Text as="h2">Humans List</Text>
        <div className="list-grid">
          {useAppContext().humans.map(user => (
            <HumanCard key={user.id} humanId={user.id} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    );
  } else if (currentPage === 'skills') {
    ContentComponent = () => (
      <div>
        <Text as="h2">Skills List</Text>
        <div className="list-grid">
          {useAppContext().skills.map(skill => (
            <SkillCard key={skill.id} skillId={skill.id} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    );
  } else if (currentPage === 'customers') {
    ContentComponent = () => (
      <div>
        <Text as="h2">Customers List</Text>
        <div className="list-grid">
          {useAppContext().customers.map(customer => (
            <CustomerCard key={customer.id} customerId={customer.id} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    );
  } else if (currentPage === 'interview') {
    ContentComponent = InterviewPage;
  } else if (currentPage === 'entity') {
    ContentComponent = () => (
      <div>
        <SecondaryButton onClick={() => handleNavigate('home')}>
          Back to Home
        </SecondaryButton>
        <EntityPage entity={currentEntity} onNavigate={handleNavigate} />
      </div>
    );
  } else {
    ContentComponent = () => <Text as="p">Page not found.</Text>;
  }

  return (
    <AppProvider>
      <div className="app-container">
        <Header />
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="app-main">
          <ContentComponent onNavigate={handleNavigate} />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
