import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Award,
  Truck,
  Car,
  BusFront,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { distributeRest, VEHICLE_TYPES } from './utils/scheduler';

const DEFAULT_DAILY_NEEDS = [8, 8, 8, 8, 8, 6, 6]; // Lun - Dom
const DAYS_SPANISH = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function App() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('drivers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Juan Perez', type: VEHICLE_TYPES.VAN, priority: false, preferredRestDays: [] },
      { id: '2', name: 'Maria Lopez', type: VEHICLE_TYPES.VAN, priority: false, preferredRestDays: [] },
      { id: '3', name: 'Carlos Ruiz', type: VEHICLE_TYPES.TRUCK, priority: false, preferredRestDays: [] },
    ];
  });

  const [dailyNeeds, setDailyNeeds] = useState(() => {
    const saved = localStorage.getItem('dailyNeeds');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_NEEDS;
  });

  const [schedule, setSchedule] = useState(null);
  const [newDriver, setNewDriver] = useState({ name: '', type: VEHICLE_TYPES.VAN });

  useEffect(() => {
    localStorage.setItem('drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('dailyNeeds', JSON.stringify(dailyNeeds));
  }, [dailyNeeds]);

  const addDriver = () => {
    if (!newDriver.name) return;
    setDrivers([...drivers, { ...newDriver, id: Date.now().toString(), priority: false, preferredRestDays: [] }]);
    setNewDriver({ name: '', type: VEHICLE_TYPES.VAN });
  };

  const removeDriver = (id) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const togglePriority = (id) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, priority: !d.priority } : d));
  };

  const togglePrefPriority = (id) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, prefPriority: !d.prefPriority } : d));
  };

  const togglePreferredRestDay = (driverId, dayIndex) => {
    setDrivers(drivers.map(d => {
      if (d.id === driverId) {
        const preferred = d.preferredRestDays.includes(dayIndex)
          ? d.preferredRestDays.filter(day => day !== dayIndex)
          : [...d.preferredRestDays, dayIndex];
        return { ...d, preferredRestDays: preferred };
      }
      return d;
    }));
  };

  const generateSchedule = () => {
    const newSchedule = distributeRest(drivers, dailyNeeds);
    setSchedule(newSchedule);
    setActiveTab('schedule');
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center' }}>
        <h1 className="title">Distribuidor de Descansos</h1>
        <div className="header-tabs">
          <button
            className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'glass'}`}
            onClick={() => setActiveTab('drivers')}
          >
            <Users size={18} /> Conductores
          </button>
          <button
            className={`btn ${activeTab === 'config' ? 'btn-primary' : 'glass'}`}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={18} /> Configuración
          </button>
          <button
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'glass'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={18} /> Horario
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'drivers' && (
          <div className="main-grid">
            <div className="glass card">
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users /> Flota de Conductores ({drivers.length})
              </h2>
              <div className="grid">
                {drivers.map(driver => (
                  <div key={driver.id} className="glass" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className={`badge badge-${driver.type.toLowerCase() === 'van' ? 'van' : driver.type.toLowerCase() === 'camioneta' ? 'truck' : 'car'}`}>
                        {driver.type === VEHICLE_TYPES.VAN ? <BusFront size={16} /> : driver.type === VEHICLE_TYPES.TRUCK ? <Truck size={16} /> : <Car size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{driver.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{driver.type}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => togglePriority(driver.id)}
                        className={`btn ${driver.priority ? 'btn-primary' : 'glass'}`}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        title="Prioridad para esta semana"
                      >
                        <Award size={14} /> {driver.priority ? 'Prioritario' : 'Normal'}
                      </button>
                      <button onClick={() => removeDriver(driver.id)} className="btn glass" style={{ color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass card">
              <h3 style={{ marginBottom: '15px' }}>Nuevo Conductor</h3>
              <div className="grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej. Pedro Picapiedra"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo de Vehículo</label>
                  <select
                    value={newDriver.type}
                    onChange={(e) => setNewDriver({ ...newDriver, type: e.target.value })}
                  >
                    <option value={VEHICLE_TYPES.VAN}>🚐 Van (Grande)</option>
                    <option value={VEHICLE_TYPES.TRUCK}>🛻 Camioneta</option>
                    <option value={VEHICLE_TYPES.CAR}>🚗 Auto</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={addDriver} style={{ marginTop: '10px' }}>
                  <Plus size={18} /> Agregar Conductor
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} onClick={generateSchedule}>
                  <RefreshCw size={18} /> Generar Horario
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="glass card">
            <h2 style={{ marginBottom: '20px' }}><Settings /> Requerimientos Diarios</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Especifica cuántos conductores se necesitan trabajando cada día. Los conductores restantes descansarán.
            </p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {DAYS_SPANISH.map((day, idx) => (
                <div key={day} className="glass" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{day}</div>
                  <input
                    type="number"
                    min="0"
                    max={drivers.length}
                    style={{ width: '100%', textAlign: 'center' }}
                    value={dailyNeeds[idx]}
                    onChange={(e) => {
                      const newNeeds = [...dailyNeeds];
                      newNeeds[idx] = parseInt(e.target.value) || 0;
                      setDailyNeeds(newNeeds);
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Descansan: {Math.max(0, drivers.length - dailyNeeds[idx])}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px' }}>
              <h3>Preferencias de Descanso</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                Selecciona qué días prefiere descansar cada conductor. El sistema intentará tomarlos en cuenta.
              </p>
              <div className="grid">
                {drivers.map(driver => (
                  <div key={driver.id} className="glass" style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {driver.name}
                      <button
                        onClick={() => togglePrefPriority(driver.id)}
                        className={`btn ${driver.prefPriority ? 'btn-primary' : 'glass'}`}
                        style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                      >
                        Prioridad Pref.
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {DAYS_SPANISH.map((day, dIdx) => (
                        <button
                          key={day}
                          onClick={() => togglePreferredRestDay(driver.id, dIdx)}
                          className={`btn ${driver.preferredRestDays.includes(dIdx) ? 'btn-primary' : 'glass'}`}
                          style={{ padding: '4px 8px', fontSize: '0.7rem', minWidth: '40px' }}
                        >
                          {day.substring(0, 2)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="glass card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2><Calendar /> Horario Semanal Generado</h2>
              <button className="btn btn-primary" onClick={generateSchedule}>
                <RefreshCw size={16} /> Regenerar
              </button>
            </div>

            {!schedule ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Presiona "Generar Horario" para crear la distribución.
              </div>
            ) : (
              <div className="schedule-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)' }}>Conductor</th>
                      <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid var(--border)' }}>Vehículo</th>
                      {DAYS_SPANISH.map(day => (
                        <th key={day} style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid var(--border)' }}>{day}</th>
                      ))}
                      <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid var(--border)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => {
                      const driverRests = schedule[driver.id] || [];
                      const totalRests = driverRests.filter(r => r).length;
                      return (
                        <tr key={driver.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '600' }}>{driver.name}</div>
                            {driver.priority && <div style={{ fontSize: '0.6rem', color: 'var(--primary)' }}>PRIORITARIO</div>}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span className={`badge badge-${driver.type.toLowerCase() === 'van' ? 'van' : driver.type.toLowerCase() === 'camioneta' ? 'truck' : 'car'}`} style={{ fontSize: '0.6rem' }}>
                              {driver.type}
                            </span>
                          </td>
                          {driverRests.map((isResting, idx) => (
                            <td key={idx} style={{ padding: '12px', textAlign: 'center' }}>
                              {isResting ? (
                                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                  DESCANSÓ
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Activo</span>
                              )}
                            </td>
                          ))}
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {totalRests} d
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
        }
      </main >
    </div >
  );
}

export default App;
