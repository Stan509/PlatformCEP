import React from 'react';
import { HAITI_DEPARTMENTS, getCommunesForDepartment, getCommuneByCodeOrName } from '../../lib/haitiGeoData';

interface CascadingGeoSelectProps {
  selectedDepartment: string;
  selectedCommune: string;
  selectedCirconscription?: string;
  onDepartmentChange: (deptName: string) => void;
  onCommuneChange: (communeName: string) => void;
  onCirconscriptionChange?: (circName: string) => void;
  showCirconscription?: boolean;
}

/**
 * Composant de sélection géographique en cascade (Département ➔ Commune ➔ Circonscription Électorale).
 */
export const CascadingGeoSelect: React.FC<CascadingGeoSelectProps> = ({
  selectedDepartment,
  selectedCommune,
  selectedCirconscription = '',
  onDepartmentChange,
  onCommuneChange,
  onCirconscriptionChange,
  showCirconscription = true,
}) => {
  const communes = getCommunesForDepartment(selectedDepartment);
  const activeCommuneObj = getCommuneByCodeOrName(selectedDepartment, selectedCommune);

  const handleDeptSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dept = e.target.value;
    onDepartmentChange(dept);
    // Reset commune & circonscription on department change
    const newCommunes = getCommunesForDepartment(dept);
    const defaultCommune = newCommunes.length > 0 && newCommunes[0] ? newCommunes[0].name : '';
    onCommuneChange(defaultCommune);
    if (onCirconscriptionChange && newCommunes.length > 0 && newCommunes[0]) {
      onCirconscriptionChange(newCommunes[0].circonscription);
    }
  };

  const handleCommuneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const comm = e.target.value;
    onCommuneChange(comm);
    const commObj = getCommuneByCodeOrName(selectedDepartment, comm);
    if (onCirconscriptionChange && commObj) {
      onCirconscriptionChange(commObj.circonscription);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      {/* 1. Sélection Département */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
          📍 1. Département Officiel
        </label>
        <select
          value={selectedDepartment}
          onChange={handleDeptSelect}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, background: '#fff', color: '#0f172a' }}
        >
          <option value="">-- Sélectionner un Département --</option>
          {HAITI_DEPARTMENTS.map((dept) => (
            <option key={dept.code} value={dept.name}>
              {dept.name} (Chef-lieu: {dept.chefLieu})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Sélection Commune */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
          🏛️ 2. Commune / Arrondissement
        </label>
        <select
          value={selectedCommune}
          onChange={handleCommuneSelect}
          disabled={!selectedDepartment}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, background: '#fff', color: '#0f172a', opacity: selectedDepartment ? 1 : 0.6 }}
        >
          <option value="">-- Sélectionner une Commune --</option>
          {communes.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name} (Arr. {c.arrondissement})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Circonscription Législative (Député/Sénateur) */}
      {showCirconscription && (
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
            🗳️ 3. Circonscription Électorale
          </label>
          <input
            type="text"
            readOnly
            value={activeCommuneObj?.circonscription || selectedCirconscription || 'Non rattachée'}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, background: '#e2e8f0', color: '#1e293b' }}
          />
        </div>
      )}
    </div>
  );
};
