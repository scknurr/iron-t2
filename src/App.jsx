// App.jsx
import React, { useState, useMemo, createContext, useContext } from 'react';

// Canvas Kit imports
import { CanvasProvider } from '@workday/canvas-kit-react/common';
import { GlobalHeader } from '@workday/canvas-kit-labs-react/header';
import { Flex, Box } from '@workday/canvas-kit-react/layout';
import {
  PrimaryButton,
  SecondaryButton,
  DeleteButton,
  Button
} from '@workday/canvas-kit-react/button';
import { FormField } from '@workday/canvas-kit-react/form-field';
import { TextInput } from '@workday/canvas-kit-react/text-input';
import { Select } from '@workday/canvas-kit-react/select';
import { Avatar } from '@workday/canvas-kit-react/avatar';

import './styles.css'; // minimal custom styles (see styles.css below)

/* ------------------ Context & Fake Data ------------------ */
const AppContext = createContext();

function AppProvider({ children }) {
  const initialData = useMemo(() => {
    const data = generateFakeData();
    // Limit activityFeed to 20 entries for debugging.
    data.activityFeed = data.activityFeed.slice(0, 20);
    return data;
  }, []);

  const [humans, setHumans] = useState(initialData.humans);
  const [skills, setSkills] = useState(initialData.skills);
  const [customers, setCustomers] = useState(initialData.customers);
  const [activityFeed, setActivityFeed] = useState(initialData.activityFeed);

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
    comment:
      i % 3 === 0 ? 'Merged duplicate entries' : 'Updated rating'
  }));

  return { humans, skills, customers, activityFeed };
}

/* ------------------ Components ------------------ */

/* SearchBar using Canvas Kit FormField and TextInput */
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
    <Flex gap="xs" alignItems="center">
      <FormField labelPosition={FormField.LabelPosition.Hidden}>
        <TextInput
          placeholder="Search skills, people, hospitals..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </FormField>
      <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
    </Flex>
  );
}

/* SkillGraph using a Canvas SecondaryButton */
function SkillGraph({ skill }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Box marginTop="xs">
      <SecondaryButton onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Adjacency' : 'Show Adjacency'}
      </SecondaryButton>
      {expanded && (
        <Box as="ul" padding="xs" margin={0} style={{ listStyle: 'none' }}>
          {skill.parentSkillId && (
            <li>
              <strong>Parent:</strong> {skill.parentSkillId}
            </li>
          )}
          {skill.siblingSkills &&
            skill.siblingSkills.length > 0 && (
              <li>
                <strong>Siblings:</strong>{' '}
                {skill.siblingSkills.join(', ')}
              </li>
            )}
        </Box>
      )}
    </Box>
  );
}

/* Profile Components using Canvas Kit layout and buttons */
function HumanProfile({ human, onNavigate }) {
  return (
    <Flex className="profile-grid" flexDirection="row">
      <Box className="profile-sidebar" padding="md" borderRight="1px solid #ddd">
        <Avatar size="l" altText={human.name} src={human.profilePhotoUrl} />
        <h2>{human.name}</h2>
        <p>{human.headline}</p>
        <p className="presence-status">{human.presenceStatus}</p>
        <Button onClick={() => alert('Editing profile')}>
          Edit Profile
        </Button>
      </Box>
      <Box className="profile-content" padding="md" flex="1">
        <h3>Skills &amp; Expertise</h3>
        {human.skills.map(skill => (
          <SkillCard
            key={skill.skillId}
            skillId={skill.skillId}
            rating={skill.rating}
            onNavigate={onNavigate}
          />
        ))}
        <h3>Recent Activity</h3>
        <ActivityLog entityType="HUMAN" entityId={human.id} />
      </Box>
    </Flex>
  );
}

function CustomerProfile({ customer, onNavigate }) {
  return (
    <Flex className="profile-grid" flexDirection="row">
      <Box className="profile-sidebar" padding="md" borderRight="1px solid #ddd">
        <h2>{customer.name}</h2>
        <p>
          {customer.facilityType} - {customer.ownershipType}
        </p>
        <p>EHR: {customer.ehrSystem}</p>
        <p>Trauma: {customer.traumaCenterLevel}</p>
      </Box>
      <Box className="profile-content" padding="md" flex="1">
        <h3>Staff</h3>
        {customer.humans.map(humanId => (
          <HumanCard
            key={humanId}
            humanId={humanId}
            onNavigate={onNavigate}
          />
        ))}
        <h3>Key Skills in Use</h3>
        {customer.skills.map(skillId => (
          <SkillCard
            key={skillId}
            skillId={skillId}
            onNavigate={onNavigate}
          />
        ))}
        <h3>Recent Updates</h3>
        <ActivityLog entityType="CUSTOMER" entityId={customer.id} />
      </Box>
    </Flex>
  );
}

function SkillProfile({ skill, onNavigate }) {
  return (
    <Flex className="profile-grid" flexDirection="row">
      <Box className="profile-sidebar" padding="md" borderRight="1px solid #ddd">
        <h2>{skill.name}</h2>
        <p>{skill.description}</p>
        <p className="category">{skill.category}</p>
      </Box>
      <Box className="profile-content" padding="md" flex="1">
        <h3>Endorsements</h3>
        {skill.endorsements.map(endorsement => (
          <p key={endorsement.endorserId}>
            {endorsement.comment} - {endorsement.endorserId}
          </p>
        ))}
        <h3>Who Uses This Skill?</h3>
        {skill.humans.map(humanId => (
          <HumanCard
            key={humanId}
            humanId={humanId}
            onNavigate={onNavigate}
          />
        ))}
        <h3>Where Is This Skill Applied?</h3>
        {skill.customers &&
          skill.customers.map(customerId => (
            <CustomerCard
              key={customerId}
              customerId={customerId}
              onNavigate={onNavigate}
            />
          ))}
      </Box>
    </Flex>
  );
}

/* ------------------ Card Components ------------------ */
function HumanCard({ humanId, onNavigate }) {
  const { humans } = useAppContext();
  const human = humans.find(h => h.id === humanId);
  if (!human) return null;
  return (
    <Box
      className="card human-card"
      padding="sm"
      margin="sm"
      border="1px solid #ddd"
      borderRadius="s"
      backgroundColor="#fff"
      onClick={e => {
        e.preventDefault();
        onNavigate('entity', {
          type: 'human',
          id: human.id,
          name: human.name
        });
      }}
      style={{ cursor: 'pointer' }}
    >
      <p>{human.name}</p>
    </Box>
  );
}

function CustomerCard({ customerId, onNavigate }) {
  const { customers } = useAppContext();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;
  return (
    <Box
      className="card customer-card"
      padding="sm"
      margin="sm"
      border="1px solid #ddd"
      borderRadius="s"
      backgroundColor="#fff"
      onClick={e => {
        e.preventDefault();
        onNavigate('entity', {
          type: 'customer',
          id: customer.id,
          name: customer.name
        });
      }}
      style={{ cursor: 'pointer' }}
    >
      <p>{customer.name}</p>
    </Box>
  );
}

function SkillCard({ skillId, rating, onNavigate }) {
  const { skills } = useAppContext();
  const skill = skills.find(s => s.id === skillId);
  if (!skill) return null;
  return (
    <Box className="skill-card" padding="sm" margin="sm" border="1px solid #ddd" borderRadius="s" backgroundColor="#fff">
      <h4>
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
          style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
        >
          {skill.name}
        </a>
      </h4>
      {rating && <p>Rating: {rating}</p>}
      <SkillGraph skill={skill} />
    </Box>
  );
}

/* ------------------ ActivityLog & FeedItem ------------------ */
function ActivityLog({ entityType, entityId, onNavigate }) {
  const { activityFeed } = useAppContext();
  const filteredFeed = activityFeed.filter(
    item =>
      item.entityType.toUpperCase() === entityType &&
      item.entityId === entityId
  );
  return (
    <Box className="activity-feed" padding="md" backgroundColor="#fff" border="1px solid #ddd" borderRadius="s">
      <h2>Activity Feed</h2>
      {filteredFeed.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        filteredFeed.map(item => (
          <FeedItem key={item.id} item={item} onNavigate={onNavigate} />
        ))
      )}
    </Box>
  );
}

function FeedItem({ item, onNavigate }) {
  const date = new Date(item.timestamp * 1000);
  return (
    <Box className="feed-item" padding="xs" borderBottom="1px solid #eee">
      <Box className="feed-item-header" position="relative">
        <strong>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onNavigate('entity', {
                type: 'human',
                id: item.actorId,
                name: item.actorName
              });
            }}
            style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
          >
            {item.actorName}
          </a>
        </strong>{' '}
        updated{' '}
        {item.entityName && (
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onNavigate('entity', {
                type: item.entityType.toLowerCase(),
                id: item.entityId,
                name: item.entityName
              });
            }}
            style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
          >
            {item.entityName}
          </a>
        )}{' '}
        ({item.dataField})
        <span className="timestamp" style={{ position: 'absolute', right: 0, top: 0, color: '#888', fontSize: '0.8rem' }}>
          {date.toLocaleString()}
        </span>
      </Box>
      <Box className="feed-item-comment" fontSize="sm" color="#555">
        {item.comment}
      </Box>
    </Box>
  );
}

/* ------------------ Page Components ------------------ */
function HomePage({ onNavigate }) {
  return (
    <Box className="main-content" padding="md">
      <SearchBar onSearch={query => console.log('Search query:', query)} />
      <IndicatorsPanel />
      <ActivityFeed onNavigate={onNavigate} />
    </Box>
  );
}

function IndicatorsPanel() {
  const { activityFeed, skills } = useAppContext();

  const totalActivities = activityFeed.length;
  const totalMerges = activityFeed.filter(
    item => item.dataField.toLowerCase() === 'merge'
  ).length;
  const searchItems = activityFeed.filter(
    item => item.entityType.toUpperCase() === 'SEARCH'
  );
  const topSearches = [...new Set(searchItems.map(item => item.comment))];
  const skillCoverageGaps = skills
    .filter(skill => skill.popularityScore > 70)
    .filter(skill => (skill.humans && skill.humans.length) < 3)
    .map(skill => skill.name);

  return (
    <Box className="indicators-panel" padding="md" border="1px solid #ddd" borderRadius="s" backgroundColor="#fff" marginBottom="md">
      <h2>Dashboard Insights</h2>
      <ul>
        <li>
          <strong>Total Activities:</strong> {totalActivities}
        </li>
        <li>
          <strong>Total Merges:</strong> {totalMerges}
        </li>
        {topSearches.length > 0 && (
          <li>
            <strong>Top Searches:</strong> {topSearches.join(', ')}
          </li>
        )}
        {skillCoverageGaps.length > 0 && (
          <li>
            <strong>Coverage Gaps:</strong> {skillCoverageGaps.join(', ')}
          </li>
        )}
      </ul>
    </Box>
  );
}

function HumansPage({ onNavigate }) {
  const { humans } = useAppContext();
  return (
    <Box className="page" padding="md">
      <h2>Humans</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Headline/Role</th>
            <th>Presence</th>
          </tr>
        </thead>
        <tbody>
          {humans.map(user => (
            <tr key={user.id}>
              <td>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onNavigate('entity', {
                      type: 'human',
                      id: user.id,
                      name: user.name
                    });
                  }}
                  style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
                >
                  {user.name}
                </a>
              </td>
              <td>{user.headline || 'N/A'}</td>
              <td>{user.presenceStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

function SkillsPage({ onNavigate }) {
  const { skills } = useAppContext();

  const handleMergeSkills = (skillIdA, skillIdB) => {
    console.log(`Merging skill ${skillIdA} with ${skillIdB}`);
    // TODO: Implement merge logic
  };

  return (
    <Box className="page" padding="md">
      <h2>Skills</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Adjacency</th>
            <th>Popularity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(skill => (
            <tr key={skill.id}>
              <td>
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
                  style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
                >
                  {skill.name}
                </a>
              </td>
              <td>{skill.description}</td>
              <td>{skill.category}</td>
              <td>
                {skill.parentSkillId && <span>Parent: {skill.parentSkillId} </span>}
                {skill.siblingSkills && skill.siblingSkills.join(', ')}
                <SkillGraph skill={skill} />
              </td>
              <td>{skill.popularityScore}</td>
              <td>
                {skill.siblingSkills && skill.siblingSkills.length > 0 && (
                  <DeleteButton
                    onClick={() =>
                      handleMergeSkills(skill.id, skill.siblingSkills[0])
                    }
                  >
                    Merge with {skill.siblingSkills[0]}
                  </DeleteButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

function CustomersPage({ onNavigate }) {
  const { customers } = useAppContext();
  return (
    <Box className="page" padding="md">
      <h2>Customers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Facility Type</th>
            <th>Bed Count</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(cust => (
            <tr key={cust.id}>
              <td>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onNavigate('entity', {
                      type: 'customer',
                      id: cust.id,
                      name: cust.name
                    });
                  }}
                  style={{ color: 'var(--wdc-color-primary)', textDecoration: 'none' }}
                >
                  {cust.name}
                </a>
              </td>
              <td>{cust.facilityType}</td>
              <td>{cust.bedCount}</td>
              <td>{cust.phoneNumber || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

function EntityPage({ entity, onNavigate }) {
  const { humans, customers, skills } = useAppContext();
  if (!entity) return <p>Loading...</p>;
  if (entity.type === 'human') {
    const fullEntity = humans.find(h => h.id === entity.id);
    return fullEntity ? (
      <HumanProfile human={fullEntity} onNavigate={onNavigate} />
    ) : (
      <p>Human not found</p>
    );
  } else if (entity.type === 'customer') {
    const fullEntity = customers.find(c => c.id === entity.id);
    return fullEntity ? (
      <CustomerProfile customer={fullEntity} onNavigate={onNavigate} />
    ) : (
      <p>Customer not found</p>
    );
  } else if (entity.type === 'skill') {
    const fullEntity = skills.find(s => s.id === entity.id);
    return fullEntity ? (
      <SkillProfile skill={fullEntity} onNavigate={onNavigate} />
    ) : (
      <p>Skill not found</p>
    );
  } else {
    return <p>Unknown entity type</p>;
  }
}

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
    <Box className="page" padding="md">
      <h2>Interview Workflow</h2>
      {step === 1 && (
        <Box className="interview-step" marginBottom="md">
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
          <Box marginTop="md">
            <SecondaryButton onClick={handleNext}>Next</SecondaryButton>
          </Box>
        </Box>
      )}
      {step === 2 && (
        <Box className="interview-step" marginBottom="md">
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
          <Box marginTop="md">
            <SecondaryButton onClick={handleBack} style={{ marginRight: 8 }}>
              Back
            </SecondaryButton>
            <SecondaryButton onClick={handleNext}>Next</SecondaryButton>
          </Box>
        </Box>
      )}
      {step === 3 && (
        <Box className="interview-step" marginBottom="md">
          <FormField label="Assign Skill Rating (1-5):">
            <TextInput
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
            />
          </FormField>
          <Box marginTop="md">
            <SecondaryButton onClick={handleBack} style={{ marginRight: 8 }}>
              Back
            </SecondaryButton>
            <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ------------------ Navigation Component ------------------ */
function Navigation({ currentPage, onNavigate }) {
  const pages = [
    { key: 'home', label: 'Home' },
    { key: 'humans', label: 'Humans' },
    { key: 'skills', label: 'Skills' },
    { key: 'customers', label: 'Customers' },
    { key: 'interview', label: 'Interview' }
  ];

  return (
    <Box as="nav" padding="md" backgroundColor="neutral.canvas" borderBottom="solid 3px var(--wdc-color-primary)">
      <Flex gap="xs" justifyContent="center">
        {pages.map(page => (
          <SecondaryButton
            key={page.key}
            onClick={() => onNavigate(page.key)}
            variant={currentPage === page.key ? 'inverse' : 'default'}
          >
            {page.label}
          </SecondaryButton>
        ))}
      </Flex>
    </Box>
  );
}

/* ------------------ Main App & Routing ------------------ */
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeEntity, setActiveEntity] = useState(null);

  const handleNavigation = (page, entity = null) => {
    setCurrentPage(page);
    setActiveEntity(entity);
  };

  return (
    <AppProvider>
      <CanvasProvider>
        {/* GlobalHeader from Canvas Labs */}
        <GlobalHeader
          productName="Iron Triangle BI"
          title="Dashboard"
          userDisplayName="John Doe"
          userAvatar={
            <Avatar size="s" altText="John Doe" src="https://via.placeholder.com/40" />
          }
        />
        <Flex direction="column" height="calc(100vh - 64px)">
          <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
          <Box flex="1" overflow="auto" padding="md">
            {currentPage === 'home' && <HomePage onNavigate={handleNavigation} />}
            {currentPage === 'humans' && <HumansPage onNavigate={handleNavigation} />}
            {currentPage === 'skills' && <SkillsPage onNavigate={handleNavigation} />}
            {currentPage === 'customers' && <CustomersPage onNavigate={handleNavigation} />}
            {currentPage === 'entity' && activeEntity && (
              <EntityPage entity={activeEntity} onNavigate={handleNavigation} />
            )}
            {currentPage === 'interview' && <InterviewPage onNavigate={handleNavigation} />}
          </Box>
        </Flex>
      </CanvasProvider>
    </AppProvider>
  );
}
