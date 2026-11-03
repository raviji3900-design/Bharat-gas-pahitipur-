import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Briefcase,
  Calendar,
  IndianRupee,
  Edit2,
  Trash2,
  X,
  Camera,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Employee } from '../types';
import { Language, translations } from '../utils/i18n';
import { PRESET_AVATARS } from '../utils/storage';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  language: Language;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  language,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(25000);
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [photo, setPhoto] = useState(PRESET_AVATARS[0]);
  const [error, setError] = useState<string | null>(null);

  const activeEmployees = employees.filter((e) => e.isActive);
  const isLimitReached = activeEmployees.length >= 10;

  const openAddModal = () => {
    if (isLimitReached) {
      alert(t.employeeLimitAlert);
      return;
    }
    setEditingEmployee(null);
    setName('');
    // Auto-suggest next ID
    const nextNum = employees.length + 1;
    setEmployeeId(`EMP-${String(nextNum).padStart(3, '0')}`);
    setMobile('');
    setDesignation('');
    setDepartment('General');
    setMonthlySalary(25000);
    setJoiningDate(new Date().toISOString().substring(0, 10));
    setPhoto(PRESET_AVATARS[(employees.length) % PRESET_AVATARS.length]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmployeeId(emp.id);
    setMobile(emp.mobile);
    setDesignation(emp.designation);
    setDepartment(emp.department);
    setMonthlySalary(emp.monthlySalary);
    setJoiningDate(emp.joiningDate);
    setPhoto(emp.photo);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'hi' ? 'कृपया कर्मचारी का नाम दर्ज करें' : 'Please enter employee name');
      return;
    }
    if (!employeeId.trim()) {
      setError(language === 'hi' ? 'कृपया कर्मचारी आईडी दर्ज करें' : 'Please enter employee ID');
      return;
    }

    // Check duplicate ID if new
    if (!editingEmployee && employees.some((e) => e.id.toLowerCase() === employeeId.trim().toLowerCase())) {
      setError(language === 'hi' ? 'यह आईडी पहले से मौजूद है' : 'This Employee ID already exists');
      return;
    }

    const payload: Employee = {
      id: employeeId.trim(),
      name: name.trim(),
      mobile: mobile.trim() || 'N/A',
      designation: designation.trim() || 'Staff',
      department: department.trim() || 'General',
      monthlySalary: Number(monthlySalary) || 0,
      joiningDate: joiningDate || new Date().toISOString().substring(0, 10),
      photo: photo || PRESET_AVATARS[0],
      isActive: true,
    };

    if (editingEmployee) {
      onUpdateEmployee(payload);
    } else {
      onAddEmployee(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, empName: string) => {
    if (window.confirm(`${t.confirmDelete}\n(${empName})`)) {
      onDeleteEmployee(id);
    }
  };

  const filtered = activeEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-3.5 space-y-3.5">
      {/* Header & Capacity Gauge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">
            {t.employeeManagement}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeEmployees.length} of 10 slots used
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          disabled={isLimitReached}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-md transition ${
            isLimitReached
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/30'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addEmployee}</span>
        </button>
      </div>

      {/* 10 Employee Capacity Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            activeEmployees.length >= 10 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${(activeEmployees.length / 10) * 100}%` }}
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Employees Grid / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">{t.noEmployeesFound}</p>
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {emp.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {emp.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {emp.designation}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {emp.department}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition"
                    title={t.editEmployee}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                    title={t.deleteEmployee}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Quick Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                {emp.mobile && emp.mobile !== 'N/A' && (
                  <a
                    href={`tel:${emp.mobile}`}
                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-medium truncate">
                      {emp.mobile}
                    </span>
                  </a>
                )}

                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 justify-end">
                  <span className="text-[10px] text-slate-400">Salary:</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{emp.monthlySalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingEmployee ? t.editEmployee : t.addEmployee}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {/* Photo Avatar Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.photoUpload}
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={photo}
                    alt="Current avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shadow"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer hover:bg-emerald-100 transition w-fit">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Avatars Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhoto(preset)}
                      className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        photo === preset
                          ? 'border-emerald-500 scale-105 shadow'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.employeeName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* ID & Mobile */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.employeeId} *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP-006"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.mobileNumber}
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Designation & Department */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.designation}
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Supervisor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.department}
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operations"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Monthly Salary & Joining Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.monthlySalary}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.joiningDate}
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployee ? t.updateEmployee : t.saveEmployee}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
