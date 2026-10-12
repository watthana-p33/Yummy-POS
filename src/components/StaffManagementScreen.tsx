import React, { useState } from 'react';
import { usePos, hasMenuPermission } from '../context/PosContext';
import type { User, MenuPermission } from '../types/pos';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Trash2,
  Edit3,
  Shield,
  Check,
} from 'lucide-react';
import { PosCard } from './common/PosCard';
import { PosInput } from './common/PosInput';
import { PosSelect } from './common/PosSelect';
import { PosButton } from './common/PosButton';
import { MenuItem, Dialog } from '@mui/material';
import manAvatar from '../assets/man.png';
import womanAvatar from '../assets/woman.jpg';

const getUserAvatar = (user?: { gender?: 'male' | 'female'; avatar?: string } | null) => {
  if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
    return user.avatar;
  }
  return user?.gender === 'female' ? womanAvatar : manAvatar;
};

export const StaffManagementScreen: React.FC = () => {
  const {
    currentUser,
    users,
    registerUser,
    updateUser,
    deleteUser,
    t,
  } = usePos();

  const isOwner = currentUser?.role === 'admin';

  // New Staff Registration State
  const [newUsername, setNewUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<'cashier' | 'manager' | 'admin'>('cashier');
  const [newAvatar, setNewAvatar] = useState<string>('👨‍🍳');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newPermissions, setNewPermissions] = useState<MenuPermission[]>(['pos', 'shifts', 'sales']);
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [userSuccessMsg, setUserSuccessMsg] = useState<string>('');

  // Edit Staff State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editRole, setEditRole] = useState<'cashier' | 'manager' | 'admin'>('cashier');
  const [editAvatar, setEditAvatar] = useState<string>('👨‍🍳');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [editPermissions, setEditPermissions] = useState<MenuPermission[]>([]);

  const PERMISSION_OPTIONS: Array<{ id: MenuPermission; label: string; icon: string }> = [
    { id: 'pos', label: t.staff.permissionPos, icon: '🛒' },
    { id: 'products', label: t.staff.permissionProducts, icon: '📦' },
    { id: 'shifts', label: t.staff.permissionShifts, icon: '⏰' },
    { id: 'staff', label: t.staff.permissionStaff, icon: '👥' },
    { id: 'sales', label: t.staff.permissionSales, icon: '📊' },
    { id: 'reports', label: t.staff.permissionReports, icon: '📑' },
  ];

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;

    registerUser({
      username: newUsername.trim(),
      name: newName.trim(),
      role: newRole,
      avatar: newAvatar,
      gender: newGender,
      permissions: newRole === 'admin'
        ? ['pos', 'products', 'shifts', 'staff', 'sales', 'reports']
        : newPermissions,
    });

    setUserSuccessMsg(`${t.staff.userCreatedSuccess}: "${newName}"`);
    setTimeout(() => setUserSuccessMsg(''), 3000);
    setNewUsername('');
    setNewName('');
    setNewGender('male');
    setNewPermissions(['pos', 'shifts', 'sales']);
    setShowAddStaffModal(false);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditAvatar(user.avatar || (user.role === 'admin' ? '🧑‍💻' : user.role === 'manager' ? '👩‍💼' : '👨‍🍳'));
    const initialGender: 'male' | 'female' = user.gender === 'female' ? 'female' : 'male';
    setEditGender(initialGender);
    if (user.permissions && Array.isArray(user.permissions)) {
      setEditPermissions([...user.permissions]);
    } else {
      if (user.role === 'admin') {
        setEditPermissions(['pos', 'products', 'shifts', 'staff', 'sales', 'reports']);
      } else if (user.role === 'manager') {
        setEditPermissions(['pos', 'products', 'shifts', 'sales', 'reports']);
      } else {
        setEditPermissions(['pos', 'shifts', 'sales']);
      }
    }
  };

  const handleToggleEditPermission = (permId: MenuPermission) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleNewPermission = (permId: MenuPermission) => {
    setNewPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const applyEditPreset = (preset: 'cashier' | 'manager' | 'full') => {
    if (preset === 'cashier') {
      setEditPermissions(['pos', 'shifts', 'sales']);
    } else if (preset === 'manager') {
      setEditPermissions(['pos', 'products', 'shifts', 'sales', 'reports']);
    } else if (preset === 'full') {
      setEditPermissions(['pos', 'products', 'shifts', 'staff', 'sales', 'reports']);
    }
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editUsername.trim()) return;

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.toLowerCase().trim(),
      role: editRole,
      avatar: editAvatar,
      gender: editGender,
      permissions: editRole === 'admin'
        ? ['pos', 'products', 'shifts', 'staff', 'sales', 'reports']
        : editPermissions,
    });

    setUserSuccessMsg(t.staff.updateSuccess);
    setTimeout(() => setUserSuccessMsg(''), 3000);
    setEditingUser(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span
              className="p-2.5 rounded-2xl text-white shadow-md relative overflow-hidden liquid-gloss"
              style={{
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
                boxShadow: `0 6px 18px -3px var(--theme-primary)`,
              }}
            >
              <Users className="w-6 h-6" />
            </span>
            {t.staff.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.staff.subtitle}
          </p>
        </div>

        {/* Quick Add Staff Button */}
        <div>
          <button
            data-testid="header-add-staff-btn"
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2.5 text-white rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs whitespace-nowrap active:scale-95 hover:opacity-90"
            style={{
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 4px 14px var(--theme-primary-border)',
            }}
          >
            <UserPlus className="w-4 h-4" />
            {t.staff.addStaffBtn}
          </button>
        </div>
      </div>

      {userSuccessMsg && (
        <div
          className="p-3.5 rounded-2xl border text-sm font-semibold flex items-center gap-2"
          style={{
            backgroundColor: 'var(--theme-primary-light)',
            borderColor: 'var(--theme-primary-border)',
            color: 'var(--theme-primary-text)',
          }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          {userSuccessMsg}
        </div>
      )}

      {/* STAFF USERS MANAGEMENT */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t.staff.title} ({users.length} {t.staff.staffCount})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <PosCard key={u.id} className="p-5 border flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs overflow-hidden"
                      style={{
                        backgroundColor: 'var(--theme-primary-light)',
                        borderColor: 'var(--theme-primary-border)',
                      }}
                    >
                      <img
                        src={getUserAvatar(u)}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {u.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        @{u.username}
                      </p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {u.role === 'admin' ? t.sidebar.admin : u.role === 'manager' ? t.sidebar.manager : t.sidebar.cashier}
                      </span>
                    </div>
                  </div>

                  {isOwner && users.length > 1 && u.id !== currentUser?.id && (
                    <button
                      data-testid={`delete-staff-btn-${u.username}`}
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                      title={t.staff.deleteStaffTitle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Menu Permissions Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    <span>{t.staff.permissionsTitle}</span>
                    {u.role === 'admin' && (
                      <span className="text-[10px] font-bold" style={{ color: 'var(--theme-primary)' }}>Full Access</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {u.role === 'admin' ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--theme-primary-light)',
                          color: 'var(--theme-primary-text)',
                          borderColor: 'var(--theme-primary-border)',
                        }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t.staff.ownerNotice}
                      </span>
                    ) : (
                      PERMISSION_OPTIONS.map((opt) => {
                        const isPermitted = hasMenuPermission(u, opt.id);
                        return (
                          <span
                            key={opt.id}
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg border transition ${
                              isPermitted
                                ? ''
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 border-slate-200 dark:border-slate-800 line-through opacity-60'
                            }`}
                            style={
                              isPermitted
                                ? {
                                    backgroundColor: 'var(--theme-primary-light)',
                                    color: 'var(--theme-primary-text)',
                                    borderColor: 'var(--theme-primary-border)',
                                  }
                                : undefined
                            }
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Action: Edit Staff Account */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                <button
                  data-testid={`edit-staff-btn-${u.username}`}
                  onClick={() => handleOpenEdit(u)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t.staff.editStaffBtn}
                </button>
              </div>
            </PosCard>
          ))}
        </div>
      </div>

      {/* MODAL: ADD STAFF ACCOUNT */}
      <Dialog
        open={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(5, 7, 12, 0.65)' } },
          paper: { elevation: 0, sx: { borderRadius: '28px', overflow: 'hidden' } },
        }}
      >
        <div className="p-6 sm:p-7 text-slate-800 dark:text-white">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
            {t.staff.addStaffBtn}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {t.staff.createStaffSubtitle}
          </p>

          <form onSubmit={handleRegisterStaff} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">{t.staff.usernameLabel}</label>
              <PosInput
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.staff.usernamePlaceholder}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">{t.staff.nameLabel}</label>
              <PosInput
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.staff.namePlaceholder}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PosSelect
                  label={t.staff.roleLabel}
                  value={newRole}
                  onChange={(e) => {
                    const role = e.target.value as 'cashier' | 'manager' | 'admin';
                    setNewRole(role);
                    if (role === 'admin') {
                      setNewPermissions(['pos', 'products', 'shifts', 'staff', 'sales', 'reports']);
                    } else if (role === 'manager') {
                      setNewPermissions(['pos', 'products', 'shifts', 'sales', 'reports']);
                    } else {
                      setNewPermissions(['pos', 'shifts', 'sales']);
                    }
                  }}
                >
                  <MenuItem value="cashier">{t.staff.roleCashier}</MenuItem>
                  <MenuItem value="manager">{t.staff.roleManager}</MenuItem>
                  <MenuItem value="admin">{t.staff.roleAdmin}</MenuItem>
                </PosSelect>
              </div>

              <div>
                <PosSelect
                  label={t.staff.emojiLabel}
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value as string)}
                >
                  <MenuItem value="👨‍🍳">{t.staff.emojiMaleCashier}</MenuItem>
                  <MenuItem value="👩‍🍳">{t.staff.emojiFemaleCashier}</MenuItem>
                  <MenuItem value="👩‍💼">{t.staff.emojiManager}</MenuItem>
                  <MenuItem value="🧑‍💻">{t.staff.emojiAdmin}</MenuItem>
                </PosSelect>
              </div>
            </div>

            {/* Gender Selection & Avatar Preview */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                {t.staff.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewGender('male');
                    if (newAvatar === '👩‍🍳') setNewAvatar('👨‍🍳');
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                    newGender === 'male'
                      ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                    <img src={manAvatar} alt="Male" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">
                      {t.staff.genderMale}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      man.png
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewGender('female');
                    if (newAvatar === '👨‍🍳') setNewAvatar('👩‍🍳');
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                    newGender === 'female'
                      ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                    <img src={womanAvatar} alt="Female" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">
                      {t.staff.genderFemale}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      woman.jpg
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Menu Permissions selection */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t.staff.permissionsTitle}
                </label>
                {newRole === 'admin' && (
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--theme-primary)' }}>
                    Full Access
                  </span>
                )}
              </div>

              {newRole === 'admin' ? (
                <div
                  className="p-3 rounded-2xl border text-xs font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    borderColor: 'var(--theme-primary-border)',
                    color: 'var(--theme-primary-text)',
                  }}
                >
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{t.staff.ownerNotice}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PERMISSION_OPTIONS.map((opt) => {
                    const isChecked = newPermissions.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleToggleNewPermission(opt.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          isChecked
                            ? ''
                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700'
                        }`}
                        style={
                          isChecked
                            ? {
                                backgroundColor: 'var(--theme-primary-light)',
                                color: 'var(--theme-primary-text)',
                                borderColor: 'var(--theme-primary)',
                              }
                            : undefined
                        }
                      >
                        <span
                          className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                            isChecked
                              ? 'text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                          style={
                            isChecked
                              ? {
                                  backgroundColor: 'var(--theme-primary)',
                                  borderColor: 'var(--theme-primary)',
                                }
                              : undefined
                          }
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-3">
              <PosButton
                variantStyle="secondary"
                type="button"
                onClick={() => setShowAddStaffModal(false)}
              >
                {t.common.cancel}
              </PosButton>
              <PosButton variantStyle="primary" type="submit">
                {t.staff.saveNewStaff}
              </PosButton>
            </div>
          </form>
        </div>
      </Dialog>

      {/* MODAL: EDIT STAFF & PERMISSIONS */}
      <Dialog
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(5, 7, 12, 0.65)',
            },
          },
          paper: {
            elevation: 0,
            sx: {
              borderRadius: '28px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        {editingUser && (
          <div className="p-6 sm:p-7 rounded-[28px] liquid-glass-card shadow-2xl border text-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              {t.staff.editStaffTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.staff.editStaffSubtitle}
            </p>

            <form onSubmit={handleSaveEditStaff} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">{t.staff.usernameLabel}</label>
                <PosInput
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder={t.staff.usernamePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">{t.staff.nameLabel}</label>
                <PosInput
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t.staff.namePlaceholder}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PosSelect
                    label={t.staff.roleLabel}
                    value={editRole}
                    onChange={(e) => {
                      const role = e.target.value as 'cashier' | 'manager' | 'admin';
                      setEditRole(role);
                      if (role === 'admin') {
                        setEditPermissions(['pos', 'products', 'shifts', 'staff', 'sales', 'reports']);
                      }
                    }}
                  >
                    <MenuItem value="cashier">{t.staff.roleCashier}</MenuItem>
                    <MenuItem value="manager">{t.staff.roleManager}</MenuItem>
                    <MenuItem value="admin">{t.staff.roleAdmin}</MenuItem>
                  </PosSelect>
                </div>

                <div>
                  <PosSelect
                    label={t.staff.emojiLabel}
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value as string)}
                  >
                    <MenuItem value="👨‍🍳">{t.staff.emojiMaleCashier}</MenuItem>
                    <MenuItem value="👩‍🍳">{t.staff.emojiFemaleCashier}</MenuItem>
                    <MenuItem value="👩‍💼">{t.staff.emojiManager}</MenuItem>
                    <MenuItem value="🧑‍💻">{t.staff.emojiAdmin}</MenuItem>
                    <MenuItem value="👤">{t.staff.emojiGeneral}</MenuItem>
                  </PosSelect>
                </div>
              </div>

              {/* Gender Selection & Avatar Preview */}
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                  {t.staff.genderLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditGender('male');
                      if (editAvatar === '👩‍🍳') setEditAvatar('👨‍🍳');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                      editGender === 'male'
                        ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                      <img src={manAvatar} alt="Male" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {t.staff.genderMale}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        man.png
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditGender('female');
                      if (editAvatar === '👨‍🍳') setEditAvatar('👩‍🍳');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                      editGender === 'female'
                        ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                      <img src={womanAvatar} alt="Female" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {t.staff.genderFemale}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        woman.jpg
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Menu Permissions Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t.staff.permissionsTitle}
                  </label>
                  {/* Quick Preset Buttons */}
                  {editRole !== 'admin' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">{t.staff.quickPresets}:</span>
                      <button
                        type="button"
                        onClick={() => applyEditPreset('cashier')}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:opacity-80 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        {t.staff.presetCashier}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEditPreset('manager')}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:opacity-80 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        {t.staff.presetManager}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEditPreset('full')}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:opacity-80 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        {t.staff.presetFull}
                      </button>
                    </div>
                  )}
                </div>

                {editRole === 'admin' ? (
                  <div
                    className="p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      borderColor: 'var(--theme-primary-border)',
                      color: 'var(--theme-primary-text)',
                    }}
                  >
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>{t.staff.ownerNotice}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERMISSION_OPTIONS.map((opt) => {
                      const isChecked = editPermissions.includes(opt.id);
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          data-testid={`toggle-perm-${opt.id}`}
                          onClick={() => handleToggleEditPermission(opt.id)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                            isChecked
                              ? ''
                              : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700'
                          }`}
                          style={
                            isChecked
                              ? {
                                  backgroundColor: 'var(--theme-primary-light)',
                                  color: 'var(--theme-primary-text)',
                                  borderColor: 'var(--theme-primary)',
                                }
                              : undefined
                          }
                        >
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                              isChecked
                                ? 'text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                            style={
                              isChecked
                                ? {
                                    backgroundColor: 'var(--theme-primary)',
                                    borderColor: 'var(--theme-primary)',
                                  }
                                : undefined
                            }
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <PosButton
                  variantStyle="secondary"
                  type="button"
                  onClick={() => setEditingUser(null)}
                >
                  {t.common.cancel}
                </PosButton>
                <PosButton
                  variantStyle="primary"
                  type="submit"
                  data-testid="save-edit-staff-btn"
                >
                  {t.common.save}
                </PosButton>
              </div>
            </form>
          </div>
        )}
      </Dialog>
    </div>
  );
};
