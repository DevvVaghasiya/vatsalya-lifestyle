import React from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Reports = () => {
  const navigate = useNavigate();

  const data = [
    { name: 'Cotton Fabric', value: 45, color: '#3B82F6' },
    { name: 'Polyester Fabric', value: 25, color: '#F59E0B' },
    { name: 'Rayon Fabric', value: 20, color: '#10B981' },
    { name: 'Others', value: 10, color: '#6366F1' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="header">
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1>Reports</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        <div className="form-group mb-4">
          <label className="form-label text-xs">Select Report Type</label>
          <div style={{ position: 'relative' }}>
            <select className="form-input" style={{ appearance: 'none', backgroundColor: 'var(--white)' }}>
              <option>Sales Report</option>
              <option>Inventory Report</option>
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="form-label text-xs">Select Period</label>
          <div style={{ position: 'relative' }}>
            <select className="form-input" style={{ appearance: 'none', backgroundColor: 'var(--white)' }}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>
        </div>

        <div className="card" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ width: '100%', padding: '0 24px' }}>
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-dark">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-dark">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        <button className="btn btn-primary">Generate Report</button>
      </div>
    </div>
  );
};

export default Reports;
