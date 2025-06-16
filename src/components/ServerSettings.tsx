import CustomAttributesTable from './CustomAttributesTable';
import ClassTable from './ClassTable';
import Handsontable from 'handsontable';
import { CheckboxCellType } from 'handsontable/cellTypes';
import ToggleButton from './ToggleButton';
import React, { useState } from 'react';
import './ToggleButton.css';

Handsontable.cellTypes.registerCellType('checkbox', CheckboxCellType);

const ServerSettings: React.FC = () => {
  const [showCustomAttr, setShowCustomAttr] = useState(true);
  const [showClass, setShowClass] = useState(true);
  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <ToggleButton isOpen={showCustomAttr} onClick={() => setShowCustomAttr(v => !v)} />
        <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: 24 }}>カスタム属性</span>
      </div>
      {showCustomAttr && <CustomAttributesTable />}
      <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 8px 0' }}>
        <ToggleButton isOpen={showClass} onClick={() => setShowClass(v => !v)} />
        <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: 24 }}>クラス</span>
      </div>
      {showClass && <ClassTable />}
    </div>
  );
};

export default ServerSettings;
