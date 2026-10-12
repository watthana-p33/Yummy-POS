import React, { useState } from 'react';
import { usePos, hasMenuPermission } from '../../context/PosContext';
import type { User, MenuPermission } from '../../types/pos';
import { FEATURE_REGISTRY, getDefaultPermissionsForRole } from '../../config/features';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Trash2,
  Edit3,
  Shield,
  Check,
  X,
} from 'lucide-react';
import { PosCard, PosInput, PosSelect, PosButton } from '../common';
import { MenuItem, Dialog, Box, useTheme, useMediaQuery } from '@mui/material';
import manAvatar from '../../assets/man.png';
import womanAvatar from '../../assets/woman.jpg';

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
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isOwner = currentUser?.role === 'admin';

  // New Staff Registration State
  const [newUsername, setNewUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<'cashier' | 'manager' | 'admin'>('cashier');
  const [newAvatar, setNewAvatar] = useState<string>('👨‍🍳');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newPermissions, setNewPermissions] = useState<MenuPermission[]>(() =>
    getDefaultPermissionsForRole('cashier')
  );
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

  const PERMISSION_OPTIONS = FEATURE_REGISTRY.map((feat) => ({
    id: feat.id,
    label: feat.getLabel(t),
    icon: feat.permissionEmoji,
  }));

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
        ? getDefaultPermissionsForRole('admin')
        : newPermissions,
    });

    setUserSuccessMsg(`${t.staff.userCreatedSuccess}: "${newName}"`);
    setTimeout(() => setUserSuccessMsg(''), 3000);
    setNewUsername('');
    setNewName('');
    setNewGender('male');
    setNewPermissions(getDefaultPermissionsForRole('cashier'));
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

  const applyEditPreset = (preset: 'cashier' | 'manager' | 'full') => {
    if (preset === 'cashier') {
      setEditPermissions(['pos', 'shifts', 'sales']);
    } else if (preset === 'manager') {
      setEditPermissions(['pos', 'products', 'shifts', 'sales', 'reports']);
    } else if (preset === 'full') {
      setEditPermissions(['pos', 'products', 'shifts', 'staff', 'sales', 'reports']);
    }
  };

  const isCashierActive =
    editPermissions.length === 3 &&
    ['pos', 'shifts', 'sales'].every((p) => editPermissions.includes(p as MenuPermission));

  const isManagerActive =
    editPermissions.length === 5 &&
    ['pos', 'products', 'shifts', 'sales', 'reports'].every((p) => editPermissions.includes(p as MenuPermission));

  const isFullActive =
    editPermissions.length === 6 &&
    ['pos', 'products', 'shifts', 'staff', 'sales', 'reports'].every((p) => editPermissions.includes(p as MenuPermission));

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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
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
        </Box>
      </div>

      {/* MODAL: ADD STAFF ACCOUNT */}
      <Dialog
        open={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobileScreen}
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
              borderRadius: isMobileScreen ? 0 : '28px',
              overflow: 'hidden',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#141822' : '#ffffff',
              border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #ebe7df',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        <div className="flex flex-col text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#ebe7df] dark:border-white/[0.08] flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#181d29]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
                  {t.staff.addStaffBtn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {t.staff.createStaffSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRegisterStaff} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <PosInput
                outsideLabel
                type="text"
                value={newUsername}
                label={t.staff.usernameLabel}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.staff.usernamePlaceholder}
                required
              />
            </div>

            <div>
              <PosInput
                outsideLabel
                type="text"
                value={newName}
                label={t.staff.nameLabel}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.staff.namePlaceholder}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PosSelect
                  outsideLabel
                  label={t.staff.roleLabel}
                  value={newRole}
                  onChange={(e) => {
                    const role = e.target.value as 'cashier' | 'manager' | 'admin';
                    setNewRole(role);
                    setNewPermissions(getDefaultPermissionsForRole(role));
                  }}
                >
                  <MenuItem value="cashier">{t.staff.roleCashier}</MenuItem>
                  <MenuItem value="manager">{t.staff.roleManager}</MenuItem>
                  <MenuItem value="admin">{t.staff.roleAdmin}</MenuItem>
                </PosSelect>
              </div>

              <div>
                <PosSelect
                  outsideLabel
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
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
              {newRole === 'admin' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.staff.permissionsTitle}
                  </label>
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
                </div>
              ) : (
                <PosSelect
                  outsideLabel
                  multiple
                  searchable
                  searchPlaceholder={t.staff.searchPermissions}
                  label={t.staff.permissionsTitle}
                  value={newPermissions}
                  onChange={(e) => {
                    const val = typeof e.target.value === 'string' ? (e.target.value.split(',') as MenuPermission[]) : (e.target.value as MenuPermission[]);
                    setNewPermissions(val);
                  }}
                  renderValue={(selected) => {
                    const list = selected as MenuPermission[];
                    if (list.length === 0) {
                      return <span className="text-slate-400 text-xs font-normal">{t.staff.noPermissionsSelected}</span>;
                    }
                    if (list.length === PERMISSION_OPTIONS.length) {
                      return (
                        <span className="text-xs font-semibold text-primary">
                          {t.staff.allPermissions} ({list.length} {t.staff.itemsUnit})
                        </span>
                      );
                    }
                    return (
                      <div className="flex flex-wrap gap-1 py-0.5">
                        {list.map((id) => {
                          const opt = PERMISSION_OPTIONS.find((o) => o.id === id);
                          return (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center gap-1"
                            >
                              {opt?.icon && <span>{opt.icon}</span>}
                              <span>{opt?.label || id}</span>
                            </span>
                          );
                        })}
                      </div>
                    );
                  }}
                >
                  {PERMISSION_OPTIONS.map((opt) => {
                    const isChecked = newPermissions.includes(opt.id);
                    return (
                      <MenuItem
                        key={opt.id}
                        value={opt.id}
                        sx={{
                          py: 1,
                          px: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          fontSize: '0.813rem',
                          fontWeight: 500,
                          backgroundColor: isChecked ? 'var(--theme-primary-light, rgba(91, 138, 114, 0.08)) !important' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'var(--theme-primary-light, rgba(91, 138, 114, 0.12))',
                          },
                        }}
                      >
                        <span
                          className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] transition flex-shrink-0 ${
                            isChecked
                              ? 'bg-primary text-white border-primary'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="text-sm">{opt.icon}</span>
                        <span className="truncate">{opt.label}</span>
                      </MenuItem>
                    );
                  })}
                </PosSelect>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <PosButton
                variantStyle="outline"
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="flex-1"
              >
                {t.common.cancel}
              </PosButton>
              <PosButton variantStyle="primary" type="submit" className="flex-1">
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
        fullScreen={isMobileScreen}
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
              borderRadius: isMobileScreen ? 0 : '28px',
              overflow: 'hidden',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#141822' : '#ffffff',
              border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #ebe7df',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        {editingUser && (
          <div className="flex flex-col text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#ebe7df] dark:border-white/[0.08] flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#181d29]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
                    {t.staff.editStaffTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {t.staff.editStaffSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <PosInput
                  outsideLabel
                  required
                  type="text"
                  value={editUsername}
                  label={t.staff.usernameLabel}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder={t.staff.usernamePlaceholder}
                />
              </div>

              <div>
                <PosInput
                  outsideLabel
                  required
                  type="text"
                  value={editName}
                  label={t.staff.nameLabel}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t.staff.namePlaceholder}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <PosSelect
                    outsideLabel
                    label={t.staff.roleLabel}
                    value={editRole}
                    onChange={(e) => {
                      const role = e.target.value as 'cashier' | 'manager' | 'admin';
                      setEditRole(role);
                      if (role === 'admin') {
                        setEditPermissions(getDefaultPermissionsForRole('admin'));
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
                    outsideLabel
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
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
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
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
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                {editRole === 'admin' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.staff.permissionsTitle}
                    </label>
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
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Header Row: Label & Presets Hint */}
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.staff.permissionsTitle}
                      </label>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {t.staff.quickPresets}
                      </span>
                    </div>

                    {/* Equal-sized 3-Column Preset Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => applyEditPreset('cashier')}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center text-center leading-snug active:scale-95 border ${
                          isCashierActive
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary font-bold ring-1 ring-primary/30 shadow-2xs'
                            : 'border-slate-200/80 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold'
                        }`}
                      >
                        <span>{t.staff.presetCashier}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyEditPreset('manager')}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center text-center leading-snug active:scale-95 border ${
                          isManagerActive
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary font-bold ring-1 ring-primary/30 shadow-2xs'
                            : 'border-slate-200/80 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold'
                        }`}
                      >
                        <span>{t.staff.presetManager}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyEditPreset('full')}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center text-center leading-snug active:scale-95 border ${
                          isFullActive
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary font-bold ring-1 ring-primary/30 shadow-2xs'
                            : 'border-slate-200/80 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold'
                        }`}
                      >
                        <span>{t.staff.presetFull}</span>
                      </button>
                    </div>

                    {/* Permissions Multi-Select */}
                    <PosSelect
                      multiple
                      searchable
                      searchPlaceholder={t.staff.searchPermissions}
                      data-testid="permissions-select"
                      value={editPermissions}
                      onChange={(e) => {
                        const val = typeof e.target.value === 'string' ? (e.target.value.split(',') as MenuPermission[]) : (e.target.value as MenuPermission[]);
                        setEditPermissions(val);
                      }}
                      renderValue={(selected) => {
                        const list = selected as MenuPermission[];
                        if (list.length === 0) {
                          return <span className="text-slate-400 text-xs font-normal">{t.staff.noPermissionsSelected}</span>;
                        }
                        if (list.length === PERMISSION_OPTIONS.length) {
                          return (
                            <span className="text-xs font-semibold text-primary">
                              {t.staff.allPermissions} ({list.length} {t.staff.itemsUnit})
                            </span>
                          );
                        }
                        return (
                          <div className="flex flex-wrap gap-1 py-0.5">
                            {list.map((id) => {
                              const opt = PERMISSION_OPTIONS.find((o) => o.id === id);
                              return (
                                <span
                                  key={id}
                                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center gap-1"
                                >
                                  {opt?.icon && <span>{opt.icon}</span>}
                                  <span>{opt?.label || id}</span>
                                </span>
                              );
                            })}
                          </div>
                        );
                      }}
                    >
                      {PERMISSION_OPTIONS.map((opt) => {
                        const isChecked = editPermissions.includes(opt.id);
                        return (
                          <MenuItem
                            key={opt.id}
                            value={opt.id}
                            data-testid={`toggle-perm-${opt.id}`}
                            sx={{
                              py: 1,
                              px: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              fontSize: '0.813rem',
                              fontWeight: 500,
                              backgroundColor: isChecked ? 'var(--theme-primary-light, rgba(91, 138, 114, 0.08)) !important' : 'transparent',
                              '&:hover': {
                                backgroundColor: 'var(--theme-primary-light, rgba(91, 138, 114, 0.12))',
                              },
                            }}
                          >
                            <span
                              className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] transition flex-shrink-0 ${
                                isChecked
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </span>
                            <span className="text-sm">{opt.icon}</span>
                            <span className="truncate">{opt.label}</span>
                          </MenuItem>
                        );
                      })}
                    </PosSelect>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <PosButton
                  variantStyle="outline"
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1"
                >
                  {t.common.cancel}
                </PosButton>
                <PosButton
                  variantStyle="primary"
                  type="submit"
                  data-testid="save-edit-staff-btn"
                  className="flex-1"
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
