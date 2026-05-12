import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatMetricValue, getBenchmarkStatus, getStatusColor } from '../client/healthMetrics';

// # AI: Start
const ExportModal = ({ isOpen, onClose, dashboardData, userId }) => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // pdf or image

  if (!isOpen || !dashboardData) return null;

  const allMetrics = dashboardData.allMetrics || [];
  const categories = dashboardData.byCategory ? Object.keys(dashboardData.byCategory) : [];

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
      'body-composition': '#3B82F6', // blue
      'metabolic': '#10B981', // green
      'cardiovascular': '#EF4444', // red
      'fitness': '#8B5CF6', // purple
      'sleep': '#6366F1' // indigo
    };
    return categoryColors[category] || '#6B7280';
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(allMetrics.map(m => m.metric.metricId));
    }
    setSelectAll(!selectAll);
  };

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => {
      const newSelection = prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId];
      
      setSelectAll(newSelection.length === allMetrics.length);
      return newSelection;
    });
  };

  const getSelectedMetricsByCategory = () => {
    const selectedData = allMetrics.filter(m => selectedMetrics.includes(m.metric.metricId));
    const grouped = {};
    
    selectedData.forEach(metricData => {
      const category = metricData.metric.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(metricData);
    });
    
    return grouped;
  };

  const generatePDFContent = () => {
    const groupedMetrics = getSelectedMetricsByCategory();
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create a temporary div for PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';

    let htmlContent = `
      <div style="margin-bottom: 30px; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
        <h1 style="color: #1f2937; margin: 0 0 10px 0; font-size: 32px; font-family: 'Playfair Display', Georgia, serif; background: linear-gradient(45deg, #059669, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Ojas</h1>
        <h2 style="color: #4b5563; margin: 0 0 10px 0; font-size: 18px;">Wellness Report</h2>
        <p style="color: #6b7280; margin: 0; font-size: 16px;">Generated on ${currentDate}</p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">User: ${userId}</p>
      </div>
    `;

    Object.entries(groupedMetrics).forEach(([category, metrics]) => {
      const categoryColor = getCategoryColor(category);
      const categoryName = getCategoryDisplayName(category);
      
      htmlContent += `
        <div style="margin-bottom: 40px;">
          <h2 style="color: ${categoryColor}; margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid ${categoryColor}; padding-bottom: 8px;">
            ${categoryName}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
      `;

      metrics.forEach(metricData => {
        const { metric, latestEntry, hasData, entries } = metricData;
        const value = latestEntry?.value;
        const status = hasData ? getBenchmarkStatus(value, metric.benchmarks) : 'unknown';
        const statusColor = getStatusColor(status);
        const formattedValue = hasData ? formatMetricValue(value, metric.unit, metric.dataType) : 'No data';
        
        // Get last updated info
        const lastUpdated = latestEntry?.timestamp 
          ? new Date(latestEntry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Never';

        // Generate mini trend chart data
        let trendSVG = '';
        if (entries && entries.length >= 2) {
          const sortedEntries = [...entries]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-7);
          
          const values = sortedEntries.map(entry => entry.value);
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const range = maxValue - minValue || 1;
          
          const width = 120;
          const height = 30;
          const padding = 2;
          
          const points = values.map((val, index) => {
            const x = padding + (index * (width - 2 * padding)) / (values.length - 1);
            const y = height - padding - ((val - minValue) / range) * (height - 2 * padding);
            return `${x},${y}`;
          }).join(' ');
          
          const firstValue = values[0];
          const lastValue = values[values.length - 1];
          const trendDirection = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
          const lineColor = trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280';
          
          trendSVG = `
            <svg width="${width}" height="${height}" style="margin-top: 8px;">
              <polyline fill="none" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>
            </svg>
          `;
        }

        const statusBgColor = status === 'excellent' ? '#dcfce7' : 
                             status === 'good' ? '#dbeafe' : 
                             status === 'average' ? '#fef3c7' : 
                             status === 'poor' ? '#fee2e2' : '#f3f4f6';
        
        const statusTextColor = status === 'excellent' ? '#166534' : 
                               status === 'good' ? '#1d4ed8' : 
                               status === 'average' ? '#d97706' : 
                               status === 'poor' ? '#dc2626' : '#6b7280';

        htmlContent += `
          <div style="border: 1px solid #e5e7eb; border-left: 4px solid ${categoryColor}; border-radius: 8px; padding: 16px; background-color: #f9fafb;">
            <div style="margin-bottom: 12px;">
              <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #1f2937;">${metric.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">${metric.unit}</p>
            </div>
            
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; background-color: ${statusBgColor}; color: ${statusTextColor};">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span style="margin-left: 8px; font-size: 14px; font-weight: 600; color: #374151;">
                ${formattedValue}
              </span>
            </div>
            
            ${trendSVG}
            
            <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
              Last updated: ${lastUpdated}
            </div>
          </div>
        `;
      });

      htmlContent += `
          </div>
        </div>
      `;
    });

    tempDiv.innerHTML = htmlContent;
    return tempDiv;
  };

  const handleExport = async () => {
    if (selectedMetrics.length === 0) {
      alert('Please select at least one metric to export.');
      return;
    }

    setIsExporting(true);

    try {
      const contentDiv = generatePDFContent();
      document.body.appendChild(contentDiv);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      if (exportFormat === 'pdf') {
        // Generate PDF
        const canvas = await html2canvas(contentDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const fileName = `health-metrics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      } else {
        // Generate image
        const canvas = await html2canvas(contentDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `health-metrics-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }

      // Clean up
      document.body.removeChild(contentDiv);
      
      // Close modal after successful export
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Export Health Metrics Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mr-2"
                />
                PDF Document
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={exportFormat === 'image'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mr-2"
                />
                PNG Image
              </label>
            </div>
          </div>

          {/* Metric Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Metrics to Export
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {categories.map(category => {
                const categoryMetrics = dashboardData.byCategory[category] || [];
                const categoryColor = getCategoryColor(category);
                
                return (
                  <div key={category} className="border-b border-gray-100 last:border-b-0">
                    <div 
                      className="px-4 py-3 font-medium text-gray-900 border-l-4"
                      style={{ borderLeftColor: categoryColor, backgroundColor: `${categoryColor}10` }}
                    >
                      {getCategoryDisplayName(category)} ({categoryMetrics.length})
                    </div>
                    <div className="px-4 py-2 space-y-2">
                      {categoryMetrics.map(metricData => {
                        const { metric, hasData, latestEntry } = metricData;
                        const isSelected = selectedMetrics.includes(metric.metricId);
                        const value = latestEntry?.value;
                        const formattedValue = hasData ? formatMetricValue(value, metric.unit, metric.dataType) : 'No data';
                        
                        return (
                          <label key={metric.metricId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMetricToggle(metric.metricId)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                                <span className="text-sm text-gray-500">{formattedValue}</span>
                              </div>
                              <div className="text-xs text-gray-500">{metric.unit}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedMetrics.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedMetrics.length}</strong> metric{selectedMetrics.length !== 1 ? 's' : ''} selected for export
                </p>
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedMetrics.length === 0 || isExporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Export {exportFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// # AI: End

export default ExportModal;
