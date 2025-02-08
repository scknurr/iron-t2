// src/App.jsx
import React, {
  useState,
  useMemo,
  createContext,
  useContext
} from 'react';
import './styles.css'; // Make sure you have a styles.css (or similar) file in the same folder

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
  const [activityFeed, setActivityFeed] = useState(
    () => initialData.activityFeed
  );

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

/* ------------------ Revised Fake Data Generation ------------------ */
function generateFakeData() {
  // Realistic human profiles
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
    // (Expand to 50 entries as needed)
  ];

  // Skills organized by medical specialty
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
    // (Expand to 50 entries as needed)
  ];

  // Realistic hospital data
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
    // (Expand to 25 entries as needed)
  ];

  const now = Math.floor(Date.now() / 1000);
  // Generate an activity feed with realistic timestamps.
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

/* ------------------ New SearchBar Component ------------------ */
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
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search skills, people, hospitals..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

/* ------------------ New SkillGraph Component ------------------ */
function SkillGraph({ skill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="skill-graph">
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Adjacency' : 'Show Adjacency'}
      </button>
      {expanded && (
        <ul>
          {skill.parentSkillId && (
            <li>
              <strong>Parent:</strong> {skill.parentSkillId}
            </li>
          )}
          {skill.siblingSkills && skill.siblingSkills.length > 0 && (
            <li>
              <strong>Siblings:</strong> {skill.siblingSkills.join(', ')}
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
        <img
          src={human.profilePhotoUrl}
          alt={human.name}
          className="profile-avatar"
        />
        <h2>{human.name}</h2>
        <p>{human.headline}</p>
        <p className="presence-status">{human.presenceStatus}</p>
        <button className="edit-profile-btn">Edit Profile</button>
      </div>
      <div className="profile-content">
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
      </div>
    </div>
  );
}

function CustomerProfile({ customer, onNavigate }) {
  return (
    <div className="profile-grid">
      <div className="profile-sidebar">
        <h2>{customer.name}</h2>
        <p>
          {customer.facilityType} - {customer.ownershipType}
        </p>
        <p>EHR: {customer.ehrSystem}</p>
        <p>Trauma: {customer.traumaCenterLevel}</p>
      </div>
      <div className="profile-content">
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
          <SkillCard key={skillId} skillId={skillId} onNavigate={onNavigate} />
        ))}
        <h3>Recent Updates</h3>
        <ActivityLog entityType="CUSTOMER" entityId={customer.id} />
      </div>
    </div>
  );
}

function SkillProfile({ skill, onNavigate }) {
  return (
    <div className="profile-grid">
      <div className="profile-sidebar">
        <h2>{skill.name}</h2>
        <p>{skill.description}</p>
        <p className="category">{skill.category}</p>
      </div>
      <div className="profile-content">
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
      </div>
    </div>
  );
}

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
      <p>{human.name}</p>
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
      <p>{customer.name}</p>
    </div>
  );
}

function SkillCard({ skillId, rating, onNavigate }) {
  const { skills } = useAppContext();
  const skill = skills.find(s => s.id === skillId);
  if (!skill) return null;
  return (
    <div className="skill-card">
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
        >
          {skill.name}
        </a>
      </h4>
      {rating && <p>Rating: {rating}</p>}
      <SkillGraph skill={skill} />
    </div>
  );
}

/* ------------------ ActivityLog Component ------------------ */
function ActivityLog({ entityType, entityId }) {
  const { activityFeed } = useAppContext();
  const filteredFeed = activityFeed.filter(
    item =>
      item.entityType.toUpperCase() === entityType &&
      item.entityId === entityId
  );
  return (
    <div className="activity-log">
      {filteredFeed.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        filteredFeed.map(item => (
          <p key={item.id}>
            {item.comment} (at{' '}
            {new Date(item.timestamp * 1000).toLocaleString()})
          </p>
        ))
      )}
    </div>
  );
}

/* ------------------ EntityPage Component ------------------ */
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

/* ------------------ InterviewPage Component ------------------ */
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
      <h2>Interview Workflow</h2>
      {step === 1 && (
        <div className="interview-step">
          <label htmlFor="human">Select a Human (User):</label>
          <select
            id="human"
            value={selectedHuman}
            onChange={e => setSelectedHuman(e.target.value)}
          >
            <option value="">--Choose a Human--</option>
            {humans.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button onClick={handleNext}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="interview-step">
          <label htmlFor="skill">Select a Skill:</label>
          <select
            id="skill"
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
          >
            <option value="">--Choose a Skill--</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.category})
              </option>
            ))}
          </select>
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div className="interview-step">
          <label htmlFor="rating">Assign Skill Rating (1-5):</label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
          />
          <button onClick={handleBack}>Back</button>
          <button onClick={handleSubmit}>Submit Interview</button>
        </div>
      )}
    </div>
  );
}

/* ------------------ Header Component ------------------ */
function Header() {
  return (
    <header className="canvas-header">
      <h1>Iron Triangle BI</h1>
      <input
        type="text"
        className="canvas-search-bar"
        placeholder="Search skills, people, hospitals..."
      />
      <div className="user-menu">
        <img
          src="https://via.placeholder.com/40"
          alt="User"
          className="canvas-profile-icon"
        />
        <span className="presence-indicator online"></span>
      </div>
    </header>
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
    <nav className="canvas-navbar">
      {pages.map(page => (
        <button
          key={page.key}
          className={`canvas-button ${
            currentPage === page.key ? 'active' : ''
          }`}
          onClick={() => onNavigate(page.key)}
        >
          {page.label}
        </button>
      ))}
    </nav>
  );
}

/* ------------------ HomePage Component ------------------ */
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
    <div className="indicators-panel">
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
    </div>
  );
}

/* ------------------ ActivityFeed Component ------------------ */
function ActivityFeed({ onNavigate }) {
  const { activityFeed } = useAppContext();

  const memoizedFeed = useMemo(() => {
    return activityFeed.map(item => (
      <FeedItem key={item.id} item={item} onNavigate={onNavigate} />
    ));
  }, [activityFeed, onNavigate]);

  return (
    <div className="activity-feed">
      <h2>Activity Feed</h2>
      {memoizedFeed}
      {activityFeed.length === 0 && <p>No recent activity.</p>}
    </div>
  );
}

/* ------------------ FeedItem Component ------------------ */
function FeedItem({ item, onNavigate }) {
  const date = new Date(item.timestamp * 1000);
  return (
    <div className="feed-item">
      <div className="feed-item-header">
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
          >
            {item.entityName}
          </a>
        )}{' '}
        ({item.dataField})
        <span className="timestamp">{date.toLocaleString()}</span>
      </div>
      <div className="feed-item-comment">{item.comment}</div>
    </div>
  );
}

/* ------------------ HumansPage Component ------------------ */
function HumansPage({ onNavigate }) {
  const { humans } = useAppContext();

  const memoizedRows = useMemo(() => {
    return humans.map(user => (
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
          >
            {user.name}
          </a>
        </td>
        {/* CodePen used user.role, but we only have user.headline or placeholders in data */}
        <td>{user.headline || 'N/A'}</td>
        <td>{user.presenceStatus}</td>
      </tr>
    ));
  }, [humans, onNavigate]);

  return (
    <div className="page">
      <h2>Humans</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Headline/Role</th>
            <th>Presence</th>
          </tr>
        </thead>
        <tbody>{memoizedRows}</tbody>
      </table>
    </div>
  );
}

/* ------------------ SkillsPage Component ------------------ */
function SkillsPage({ onNavigate }) {
  const { skills } = useAppContext();

  const handleMergeSkills = (skillIdA, skillIdB) => {
    console.log(`Merging skill ${skillIdA} with ${skillIdB}`);
    // TODO: Implement real merge logic
  };

  const memoizedRows = useMemo(() => {
    return skills.map(skill => (
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
            <button
              onClick={() => handleMergeSkills(skill.id, skill.siblingSkills[0])}
            >
              Merge with {skill.siblingSkills[0]}
            </button>
          )}
        </td>
      </tr>
    ));
  }, [skills, onNavigate]);

  return (
    <div className="page">
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
        <tbody>{memoizedRows}</tbody>
      </table>
    </div>
  );
}

/* ------------------ CustomersPage Component ------------------ */
function CustomersPage({ onNavigate }) {
  const { customers } = useAppContext();

  const memoizedRows = useMemo(() => {
    return customers.map(cust => (
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
          >
            {cust.name}
          </a>
        </td>
        <td>{cust.facilityType}</td>
        <td>{cust.bedCount}</td>
        <td>{cust.phoneNumber || 'N/A'}</td>
      </tr>
    ));
  }, [customers, onNavigate]);

  return (
    <div className="page">
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
        <tbody>{memoizedRows}</tbody>
      </table>
    </div>
  );
}

/* ------------------ Main Application & Routing ------------------ */
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeEntity, setActiveEntity] = useState(null);

  const handleNavigation = (page, entity = null) => {
    setCurrentPage(page);
    setActiveEntity(entity);
  };

  return (
    <AppProvider>
      <div className="app">
        <Header />
        <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
        {currentPage === 'home' && <HomePage onNavigate={handleNavigation} />}
        {currentPage === 'humans' && (
          <HumansPage onNavigate={handleNavigation} />
        )}
        {currentPage === 'skills' && (
          <SkillsPage onNavigate={handleNavigation} />
        )}
        {currentPage === 'customers' && (
          <CustomersPage onNavigate={handleNavigation} />
        )}
        {currentPage === 'entity' && activeEntity && (
          <EntityPage entity={activeEntity} onNavigate={handleNavigation} />
        )}
        {currentPage === 'interview' && (
          <InterviewPage onNavigate={handleNavigation} />
        )}
      </div>
    </AppProvider>
  );
}

