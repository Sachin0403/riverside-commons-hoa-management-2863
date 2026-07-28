export type UserRole = 'board-member' | 'property-manager' | 'resident';

export function getUserRole(user: any): UserRole {
  if (!user?.groups) return 'resident';
  const groupKeys = user.groups.map((g: any) => g.key || g);
  if (groupKeys.includes('board-member')) return 'board-member';
  if (groupKeys.includes('property-manager')) return 'property-manager';
  return 'resident';
}

export function getUserUnit(user: any): string {
  return user?.userMetadata?.unit || '';
}

export function canManageAnnouncements(role: UserRole): boolean {
  return role === 'board-member';
}

export function canManageMaintenance(role: UserRole): boolean {
  return role === 'board-member' || role === 'property-manager';
}

export function canManageDocuments(role: UserRole): boolean {
  return role === 'board-member' || role === 'property-manager';
}

export function canViewFinancials(role: UserRole): boolean {
  return role === 'board-member';
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'board-member': return 'Board Member';
    case 'property-manager': return 'Property Manager';
    case 'resident': return 'Resident';
  }
}
