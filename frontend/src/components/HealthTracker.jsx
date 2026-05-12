import { useState, useEffect } from 'react';
import { getDashboardData, addHealthEntry, setUserGoal, saveUserPreferences, getAllMetricEntries, updateHealthEntry, deleteHealthEntry } from '../client/healthMetrics';
import { getLoggedInUser } from '../utils/auth';
import { getBenchmarkStatus, getStatusColor, formatMetricValue } from '../client/healthMetrics';
import ExportModal from './ExportModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// # AI: Start
const HealthTracker = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [entryValue, setEntryValue] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [detailedMetric, setDetailedMetric] = useState(null);
  const [showManageEntries, setShowManageEntries] = useState(false);
  const [manageEntriesMetric, setManageEntriesMetric] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const loggedInUser = getLoggedInUser();
  const userId = loggedInUser?.username || 'demo-user';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading dashboard data for user:', userId);
      
      const response = await getDashboardData(userId);
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load health metrics data');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load health metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!selectedMetric || !entryValue) return;

    try {
      setSubmitting(true);
      
      // Use provided date or current date
      let timestamp;
      if (entryDate) {
        timestamp = new Date(entryDate).toISOString();
      } else {
        timestamp = new Date().toISOString();
      }

      const entryData = {
        userId,
        metricId: selectedMetric.metricId,
        value: parseFloat(entryValue),
        notes: entryNotes,
        timestamp
      };

      const response = await addHealthEntry(entryData);
      if (response.success) {
        // Reload dashboard data
        await loadDashboardData();
        // If manage entries is open, reload that too
        if (showManageEntries && manageEntriesMetric) {
          await loadAllEntries(manageEntriesMetric);
        }
        // Reset form
        setShowAddEntry(false);
        setSelectedMetric(null);
        setEntryValue('');
        setEntryDate('');
        setEntryNotes('');
      } else {
        setError('Failed to add health entry');
      }
    } catch (err) {
      console.error('Error adding entry:', err);
      setError('Failed to add health entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadAllEntries = async (metric) => {
    try {
      const response = await getAllMetricEntries(userId, metric.metricId);
      if (response.success) {
        setAllEntries(response.data.entries);
      } else {
        setError('Failed to load entries');
      }
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load entries. Please try again.');
    }
  };

  const handleManageEntries = async (metric) => {
    setManageEntriesMetric(metric);
    setShowManageEntries(true);
    await loadAllEntries(metric);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditValue(entry.value.toString());
    setEditDate(new Date(entry.timestamp).toISOString().split('T')[0]);
    setEditNotes(entry.notes || '');
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editValue) return;

    try {
      setSubmitting(true);
      
      const entryData = {
        value: parseFloat(editValue),
        timestamp: new Date(editDate).toISOString(),
        notes: editNotes
      };

      const response = await updateHealthEntry(editingEntry._id, entryData);
      if (response.success) {
        // Reload data
        await loadDashboardData();
        await loadAllEntries(manageEntriesMetric);
        // Reset edit form
        setEditingEntry(null);
        setEditValue('');
        setEditDate('');
        setEditNotes('');
      } else {
        setError('Failed to update entry');
      }
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await deleteHealthEntry(entryId);
      if (response.success) {
        // Reload data
        await loadDashboardData();
        await loadAllEntries(manageEntriesMetric);
      } else {
        setError('Failed to delete entry');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const filteredMetrics = getFilteredMetrics();
      const oldIndex = filteredMetrics.findIndex(item => item.metric.metricId === active.id);
      const newIndex = filteredMetrics.findIndex(item => item.metric.metricId === over.id);

      const newOrder = arrayMove(filteredMetrics, oldIndex, newIndex);
      
      // Update local state immediately for better UX
      const updatedData = { ...dashboardData };
      if (selectedCategory === 'all') {
        updatedData.allMetrics = newOrder;
      } else {
        updatedData.byCategory[selectedCategory] = newOrder;
      }
      setDashboardData(updatedData);

      // Save the new order to the backend
      try {
        const metricOrder = newOrder.map((item, index) => ({
          metricId: item.metric.metricId,
          position: index
        }));

        await saveUserPreferences(userId, { metricOrder });
        console.log('Metric order saved successfully');
      } catch (error) {
        console.error('Failed to save metric order:', error);
        // Optionally reload data to revert changes
        loadDashboardData();
      }
    }
  };

  const getFilteredMetrics = () => {
    if (!dashboardData) return [];
    
    if (selectedCategory === 'all') {
      return dashboardData.allMetrics || [];
    }
    
    return dashboardData.byCategory[selectedCategory] || [];
  };

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'body-composition': 'Body Composition',
      'metabolic': 'Metabolic Health',
      'cardiovascular': 'Cardiovascular',
      'fitness': 'Functional Fitness',
      'sleep': 'Sleep & Recovery'
    };
    return categoryNames[category] || category;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'body-composition': 'border-l-blue-500 bg-blue-50',
      'metabolic': 'border-l-green-500 bg-green-50',
      'cardiovascular': 'border-l-red-500 bg-red-50',
      'fitness': 'border-l-purple-500 bg-purple-50',
      'sleep': 'border-l-indigo-500 bg-indigo-50'
    };
    return categoryColors[category] || 'border-l-gray-500 bg-gray-50';
  };

  const getCategoryButtonColor = (category, isSelected) => {
    const categoryButtonColors = {
      'body-composition': isSelected 
        ? 'bg-blue-600 text-white' 
        : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      'metabolic': isSelected 
        ? 'bg-green-600 text-white' 
        : 'bg-green-100 text-green-700 hover:bg-green-200',
      'cardiovascular': isSelected 
        ? 'bg-red-600 text-white' 
        : 'bg-red-100 text-red-700 hover:bg-red-200',
      'fitness': isSelected 
        ? 'bg-purple-600 text-white' 
        : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      'sleep': isSelected 
        ? 'bg-indigo-600 text-white' 
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    };
    return categoryButtonColors[category] || (isSelected 
      ? 'bg-gray-600 text-white' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200');
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays <= 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays <= 14) {
      return 'Last week';
    } else if (diffInDays <= 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays <= 60) {
      return 'Last month';
    } else if (diffInDays <= 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const TrendVisualization = ({ entries, unit, dataType }) => {
    if (!entries || entries.length < 2) {
      return null; // Don't show anything if insufficient data
    }

    // Sort entries by timestamp and take last 7 for mini chart
    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-7);

    const values = sortedEntries.map(entry => entry.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero

    // SVG dimensions - make wider since we removed the label
    const width = 140;
    const height = 30;
    const padding = 2;

    // Calculate points for the line
    const points = values.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (values.length - 1);
      const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    // Get last point for the dot
    const lastValue = values[values.length - 1];
    const lastPoint = values.length > 0 ? {
      x: padding + ((values.length - 1) * (width - 2 * padding)) / (values.length - 1),
      y: height - padding - ((lastValue - minValue) / range) * (height - 2 * padding)
    } : null;

    // Calculate trend direction for color
    const firstValue = values[0];
    const trendDirection = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
    const lineColor = trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280';

    return (
      <div className="mt-3">
        <svg width={width} height={height} className="overflow-visible">
          {/* Trend line */}
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Last point dot */}
          {lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="3"
              fill={lineColor}
              stroke="white"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>
    );
  };

  const StatusIndicator = ({ status, value, unit, dataType }) => {
    const colorClass = getStatusColor(status);
    const formattedValue = formatMetricValue(value, unit, dataType);
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          {formattedValue}
        </span>
      </div>
    );
  };

  const DetailedChart = ({ entries, unit, dataType, metricName }) => {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

    if (!entries || entries.length < 2) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-lg mb-2">📊</div>
            <div>Need more data points to show detailed chart</div>
          </div>
        </div>
      );
    }

    // Sort entries by timestamp
    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const values = sortedEntries.map(entry => entry.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // SVG dimensions for detailed chart
    const width = 500;
    const height = 200;
    const padding = 40;

    // Calculate points for the line
    const points = values.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (values.length - 1);
      const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
      return { x, y, value, date: sortedEntries[index].timestamp };
    });

    const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    // Calculate trend
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const trendDirection = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
    const lineColor = trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280';

    const handleMouseEnter = (point, event) => {
      const rect = event.currentTarget.closest('svg').getBoundingClientRect();
      const date = new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const content = `${formatMetricValue(point.value, unit, dataType)} on ${date}`;
      
      setTooltip({
        show: true,
        x: rect.left + point.x + 10,
        y: rect.top + point.y - 10,
        content
      });
    };

    const handleMouseLeave = () => {
      setTooltip({ show: false, x: 0, y: 0, content: '' });
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{metricName}</h3>
          <p className="text-sm text-gray-600">{entries.length} data points</p>
        </div>
        
        <div className="flex justify-center relative">
          <svg width={width} height={height} className="border border-gray-200 rounded">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Trend line */}
            <polyline
              fill="none"
              stroke={lineColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePoints}
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={lineColor}
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => handleMouseEnter(point, e)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
            
            {/* Y-axis labels */}
            <text x="10" y="15" fontSize="10" fill="#6b7280">
              {formatMetricValue(maxValue, unit, dataType)}
            </text>
            <text x="10" y={height - 5} fontSize="10" fill="#6b7280">
              {formatMetricValue(minValue, unit, dataType)}
            </text>
          </svg>
          
          {/* Tooltip */}
          {tooltip.show && (
            <div
              className="fixed z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SortableMetricCard = ({ metricData }) => {
    const { metric, latestEntry, hasData, entries } = metricData;
    const value = latestEntry?.value;
    const status = hasData ? getBenchmarkStatus(value, metric.benchmarks) : 'unknown';
    const lastUpdated = latestEntry?.timestamp ? getRelativeTime(latestEntry.timestamp) : 'Never';
    const categoryColorClass = getCategoryColor(metric.category);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: metric.metricId });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const handleCardClick = (e) => {
      // Don't trigger if clicking on drag handle or update button
      if (e.target.closest('[data-drag-handle]') || e.target.closest('button')) {
        return;
      }
      setDetailedMetric(metricData);
      setShowDetailedView(true);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={`rounded-lg border border-gray-200 border-l-4 p-4 hover:shadow-md transition-shadow cursor-pointer ${categoryColorClass} ${
          isDragging ? 'shadow-lg z-10' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div
              {...attributes}
              {...listeners}
              data-drag-handle
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
              title="Drag to reorder"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="2" cy="2" r="1"/>
                <circle cx="6" cy="2" r="1"/>
                <circle cx="10" cy="2" r="1"/>
                <circle cx="2" cy="6" r="1"/>
                <circle cx="6" cy="6" r="1"/>
                <circle cx="10" cy="6" r="1"/>
                <circle cx="2" cy="10" r="1"/>
                <circle cx="6" cy="10" r="1"/>
                <circle cx="10" cy="10" r="1"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{metric.name}</h3>
              <p className="text-xs text-gray-500">{metric.unit}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMetric(metric);
              setShowAddEntry(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            Update
          </button>
        </div>
        
        {hasData ? (
          <StatusIndicator 
            status={status} 
            value={value} 
            unit={metric.unit} 
            dataType={metric.dataType} 
          />
        ) : (
          <div className="text-gray-400 text-sm">No data yet</div>
        )}
        
        {/* Trend Visualization */}
        <TrendVisualization 
          entries={entries} 
          unit={metric.unit} 
          dataType={metric.dataType} 
        />
        
        <div className="mt-2 text-xs text-gray-500">
          Last updated: {lastUpdated}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
        <span className="ml-3 text-gray-500">Loading health metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const categories = dashboardData?.byCategory ? Object.keys(dashboardData.byCategory) : [];
  const filteredMetrics = getFilteredMetrics();

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end items-center">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setShowAddEntry(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Entry
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({dashboardData?.allMetrics?.length || 0})
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${getCategoryButtonColor(category, selectedCategory === category)}`}
          >
            {getCategoryDisplayName(category)} ({dashboardData.byCategory[category]?.length || 0})
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredMetrics.map(item => item.metric.metricId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMetrics.map((metricData) => (
              <SortableMetricCard key={metricData.metric.metricId} metricData={metricData} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredMetrics.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No metrics found</div>
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'No health metrics available' 
              : `No metrics in ${getCategoryDisplayName(selectedCategory)} category`}
          </p>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedMetric ? `Update ${selectedMetric.name}` : 'Add Health Entry'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEntry(false);
                  setSelectedMetric(null);
                  setEntryValue('');
                  setEntryDate('');
                  setEntryNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {!selectedMetric ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Metric
                  </label>
                  <select
                    value={selectedMetric?.metricId || ''}
                    onChange={(e) => {
                      const metric = dashboardData.allMetrics.find(
                        m => m.metric.metricId === e.target.value
                      )?.metric;
                      setSelectedMetric(metric);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a metric...</option>
                    {dashboardData.allMetrics.map(({ metric }) => (
                      <option key={metric.metricId} value={metric.metricId}>
                        {metric.name} ({metric.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedMetric.name} ({selectedMetric.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryValue}
                    onChange={(e) => setEntryValue(e.target.value)}
                    placeholder={`Enter value in ${selectedMetric.unit}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date (optional - defaults to today)
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    placeholder="Add any notes about this measurement..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAddEntry(false);
                      setSelectedMetric(null);
                      setEntryValue('');
                      setEntryDate('');
                      setEntryNotes('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEntry}
                    disabled={!entryValue || submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding...' : 'Add Entry'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetailedView && detailedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {detailedMetric.metric.name} - Detailed View
              </h3>
              <button
                onClick={() => {
                  setShowDetailedView(false);
                  setDetailedMetric(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <DetailedChart 
              entries={detailedMetric.entries} 
              unit={detailedMetric.metric.unit} 
              dataType={detailedMetric.metric.dataType} 
              metricName={detailedMetric.metric.name}
            />

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowDetailedView(false);
                  setDetailedMetric(null);
                  setSelectedMetric(detailedMetric.metric);
                  setShowAddEntry(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Entry
              </button>
              <button
                onClick={() => {
                  setShowDetailedView(false);
                  setDetailedMetric(null);
                  handleManageEntries(detailedMetric.metric);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Manage Entries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Entries Modal */}
      {showManageEntries && manageEntriesMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Manage {manageEntriesMetric.name} Entries
              </h3>
              <button
                onClick={() => {
                  setShowManageEntries(false);
                  setManageEntriesMetric(null);
                  setAllEntries([]);
                  setEditingEntry(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {allEntries.length} entries found. Click on any entry to edit or delete it.
              </p>
              <button
                onClick={() => {
                  setSelectedMetric(manageEntriesMetric);
                  setShowAddEntry(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Add New Entry
              </button>
            </div>

            {allEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">📝</div>
                <div>No entries found for this metric</div>
                <button
                  onClick={() => {
                    setSelectedMetric(manageEntriesMetric);
                    setShowAddEntry(true);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {allEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {editingEntry && editingEntry._id === entry._id ? (
                      // Edit form
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Value ({manageEntriesMetric.unit})
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Optional notes..."
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setEditingEntry(null);
                              setEditValue('');
                              setEditDate('');
                              setEditNotes('');
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateEntry}
                            disabled={!editValue || submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Updating...' : 'Update Entry'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display entry
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatMetricValue(entry.value, manageEntriesMetric.unit, manageEntriesMetric.dataType)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getRelativeTime(entry.timestamp)}
                            </div>
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-600 italic">
                              "{entry.notes}"
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry._id)}
                            disabled={submitting}
                            className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            {submitting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setShowManageEntries(false);
                  setManageEntriesMetric(null);
                  setAllEntries([]);
                  setEditingEntry(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dashboardData={dashboardData}
        userId={userId}
      />
    </div>
  );
};
// # AI: End

export default HealthTracker;
