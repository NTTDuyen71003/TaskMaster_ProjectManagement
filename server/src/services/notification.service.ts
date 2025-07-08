import { Notifications } from '../enums/notification.enum';
import { Roles } from '../enums/role.enum';
import MemberModel from '../models/member.model';
import { NotificationModel, NotificationTypeEnum } from '../models/notification.model';
import ProjectModel from '../models/project.model';
import RoleModel from '../models/roles-permission.model';
import UserModel from '../models/user.model';
import WorkspaceModel from '../models/workspace.model';


// New service for member joined notification
export const memberJoinedNotificationService = async (
  joinerUserId: string,
  workspaceId: string
) => {
  try {
    // Get joiner and workspace details
    const [joiner, workspace] = await Promise.all([
      UserModel.findById(joinerUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name owner').populate('owner', '_id')
    ]);

    if (!joiner) {
      throw new Error('Joiner not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.owner) {
      console.error('Workspace owner is missing:', { workspaceId, workspace });
      throw new Error('Workspace owner not found');
    }

    // Get all users with Owner and Admin roles in this workspace
    const ownerAndAdminRoles = await RoleModel.find({
      name: { $in: [Roles.OWNER, Roles.ADMIN] }
    }).select('_id');

    const roleIds = ownerAndAdminRoles.map(role => role._id);

    // Find all members with Owner or Admin roles in this workspace
    const adminMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: roleIds }
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = adminMembers.map(member => member.userId._id);

    // Create notifications for all Owner and Admin users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.MEMBER_JOINED,
        title: 'New Member Joined',
        message: `${joiner.name} has joined your workspace "${workspace.name}"`,
        data: {
          workspaceName: workspace.name,
          joinerName: joiner.name,
          joinerProfilePicture: joiner.profilePicture,
          joinerId: joinerUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating member joined notification:', error);
    throw error;
  }
};


// New service for remove member notification
export const memberRemovedNotificationService = async (
  removedUserId: string,
  removerUserId: string,
  workspaceId: string
) => {
  try {
    // Get remover and workspace details
    const [remover, workspace] = await Promise.all([
      UserModel.findById(removerUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name')
    ]);

    if (!remover || !workspace) {
      throw new Error('Remover or workspace not found');
    }

    const notification = new NotificationModel({
      userId: removedUserId,
      type: Notifications.MEMBER_REMOVED,
      title: 'Removed from Workspace',
      message: `${remover.name} has removed you from workspace "${workspace.name}"`,
      data: {
        workspaceName: workspace.name,
        removerName: remover.name,
        removerProfilePicture: remover.profilePicture,
        workspaceId: workspaceId
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating member removed notification:', error);
    throw error;
  }
};


// New service for workspace name changed notification
export const workspaceNameChangedNotificationService = async (
  changerUserId: string,
  workspaceId: string,
  oldName: string,
  newName: string
) => {
  try {
    // Get changer and workspace details
    const [changer, workspace] = await Promise.all([
      UserModel.findById(changerUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name')
    ]);

    if (!changer) {
      throw new Error('Changer not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Get the changer's role to determine who gets notified
    const changerMember = await MemberModel.findOne({
      userId: changerUserId,
      workspaceId: workspaceId
    }).populate('role', 'name').populate('userId', '_id');

    if (!changerMember) {
      throw new Error('Changer is not a member of this workspace');
    }

    const changerRole = changerMember.role.name;
    let targetRoles: ("ADMIN" | "MEMBER")[] = [];

    // Determine who should receive notifications based on who made the change
    if (changerRole === Roles.OWNER) {
      // If owner changed it, notify admins and members
      targetRoles = [Roles.ADMIN, Roles.MEMBER];
    }

    // Get role IDs for target roles
    const targetRoleObjects = await RoleModel.find({
      name: { $in: targetRoles }
    }).select('_id');

    const targetRoleIds = targetRoleObjects.map(role => role._id);

    // Find all members with target roles in this workspace (excluding the changer)
    const targetMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: targetRoleIds },
      userId: { $ne: changerUserId } // Exclude the person who made the change
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = targetMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for workspace name change notification');
      return [];
    }

    // Create notifications for all target users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.WORKSPACE_NAME_CHANGED,
        title: 'Workspace Name Changed',
        message: `${changer.name} changed workspace name from "${oldName}" to "${newName}"`,
        data: {
          oldWorkspaceName: oldName,
          newWorkspaceName: newName,
          changerName: changer.name,
          changerProfilePicture: changer.profilePicture,
          changerId: changerUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating workspace name changed notification:', error);
    throw error;
  }
};

// New service for member role changed notification
export const memberRoleChangedNotificationService = async (
  changerUserId: string,
  changedUserId: string,
  workspaceId: string,
  oldRole: string,
  newRole: string
) => {
  try {
    // Get changer, changed user, and workspace details
    const [changer, changedUser, workspace] = await Promise.all([
      UserModel.findById(changerUserId).select('name profilePicture'),
      UserModel.findById(changedUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name')
    ]);

    if (!changer) {
      throw new Error('Changer not found');
    }

    if (!changedUser) {
      throw new Error('Changed user not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Translation mapping for roles
    const roleTranslations = {
      [Roles.OWNER]: "Owner",
      [Roles.ADMIN]: "Admin", 
      [Roles.MEMBER]: "Member"
    };

    const translatedOldRole = roleTranslations[oldRole as keyof typeof roleTranslations] || oldRole;
    const translatedNewRole = roleTranslations[newRole as keyof typeof roleTranslations] || newRole;

    // Get all members in the workspace except the changer
    const allMembers = await MemberModel.find({
      workspaceId: workspaceId,
      userId: { $ne: changerUserId } // Exclude the person who made the change
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = allMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for member role change notification');
      return [];
    }

    // Create notifications for all members (except the changer)
    const notificationPromises = recipientUserIds.map(async (userId) => {
      // Check if this notification is for the person whose role was changed
      const isForChangedUser = userId.toString() === changedUserId;
      
      let title: string;
      let message: string;

      if (isForChangedUser) {
        // Notification for the person whose role was changed
        title = 'Your Role Changed';
        message = `${changer.name} changed your role from "${translatedOldRole}" to "${translatedNewRole}" in workspace "${workspace.name}"`;
      } else {
        // Notification for other members
        title = 'Member Role Changed';
        message = `${changer.name} changed ${changedUser.name}'s role from "${translatedOldRole}" to "${translatedNewRole}" in workspace "${workspace.name}"`;
      }

      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.MEMBER_ROLE_CHANGED,
        title: title,
        message: message,
        data: {
          workspaceName: workspace.name,
          changerName: changer.name,
          changerProfilePicture: changer.profilePicture,
          changerId: changerUserId,
          changedUserName: changedUser.name,
          changedUserProfilePicture: changedUser.profilePicture,
          changedUserId: changedUserId,
          oldRole: oldRole,
          newRole: newRole,
          oldRoleTranslated: translatedOldRole,
          newRoleTranslated: translatedNewRole,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);

    console.log(`Created ${savedNotifications.length} notifications for member role change`);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating member role changed notification:', error);
    throw error;
  }
};


// New service for workspace delete notification
export const workspaceDeletedNotificationService = async (
  ownerUserId: string,
  workspaceId: string,
  workspaceName: string
) => {
  try {
    // Get owner details
    const owner = await UserModel.findById(ownerUserId).select('name profilePicture');

    if (!owner) {
      throw new Error('Owner not found');
    }

    // Get all members in this workspace (excluding the owner)
    const allMembers = await MemberModel.find({
      workspaceId: workspaceId,
      userId: { $ne: ownerUserId } // Exclude the owner
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = allMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for workspace deletion notification');
      return [];
    }

    // Create notifications for all members (except owner)
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.WORKSPACE_DELETED,
        title: 'Workspace Deleted',
        message: `Workspace "${workspaceName}" has been deleted by ${owner.name}`,
        data: {
          workspaceName: workspaceName,
          removerName: owner.name,
          removerProfilePicture: owner.profilePicture,
          ownerId: ownerUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);

    console.log(`Created ${savedNotifications.length} notifications for workspace deletion`);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating workspace deleted notification:', error);
    throw error;
  }
};


// New service for project created notification
export const createProjectCreatedNotificationService = async (
  creatorUserId: string,
  workspaceId: string,
  projectId: string,
  projectName: string
) => {
  try {
    // Get creator, workspace, and project details
    const [creator, workspace, project] = await Promise.all([
      UserModel.findById(creatorUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('emoji')
    ]);

    if (!creator) {
      throw new Error('Creator not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get the creator's role to determine who gets notified
    const creatorMember = await MemberModel.findOne({
      userId: creatorUserId,
      workspaceId: workspaceId
    }).populate('role', 'name').populate('userId', '_id');

    if (!creatorMember) {
      throw new Error('Creator is not a member of this workspace');
    }

    const creatorRole = creatorMember.role.name;
    let targetRoles: string[] = [];

    // Determine who should receive notifications based on who created the project
    if (creatorRole === Roles.OWNER) {
      // If owner created it, notify admins and members
      targetRoles = [Roles.ADMIN, Roles.MEMBER];
    } else if (creatorRole === Roles.ADMIN) {
      // If admin created it, notify owner and members
      targetRoles = [Roles.OWNER, Roles.MEMBER];
    } else if (creatorRole === Roles.MEMBER) {
      // If member created it, notify owner and admins
      targetRoles = [Roles.OWNER, Roles.ADMIN];
    }

    // If no target roles, return empty array
    if (targetRoles.length === 0) {
      console.log('No target roles found for project creation notification');
      return [];
    }

    // Get role IDs for target roles
    const targetRoleObjects = await RoleModel.find({
      name: { $in: targetRoles }
    }).select('_id');

    const targetRoleIds = targetRoleObjects.map(role => role._id);

    // Find all members with target roles in this workspace (excluding the creator)
    const targetMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: targetRoleIds },
      userId: { $ne: creatorUserId } // Exclude the person who created the project
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = targetMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for project creation notification');
      return [];
    }

    // Create notifications for all target users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.PROJECT_CREATED,
        title: 'New Project Created',
        message: `${creator.name} created a new project "${project.emoji} ${projectName}" in workspace "${workspace.name}"`,
        data: {
          workspaceName: workspace.name,
          projectId: projectId,
          projectName: projectName,
          projectEmoji: project.emoji,
          creatorName: creator.name,
          creatorProfilePicture: creator.profilePicture,
          creatorId: creatorUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating project creation notification:', error);
    throw error;
  }
};


// New service for project name changed notification
export const projectNameChangedNotificationService = async (
  changerUserId: string,
  workspaceId: string,
  projectId: string,
  oldName: string,
  newName: string,
  oldEmoji: string,
  newEmoji: string
) => {
  try {
    // Get changer, workspace, and project details
    const [changer, workspace, project] = await Promise.all([
      UserModel.findById(changerUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('name')
    ]);

    if (!changer) {
      throw new Error('Changer not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get the changer's role to determine who gets notified
    const changerMember = await MemberModel.findOne({
      userId: changerUserId,
      workspaceId: workspaceId
    }).populate('role', 'name').populate('userId', '_id');

    if (!changerMember) {
      throw new Error('Changer is not a member of this workspace');
    }

    const changerRole = changerMember.role.name;
    let targetRoles: string[] = [];

    // Determine who should receive notifications based on who made the change
    if (changerRole === Roles.OWNER) {
      // If owner changed it, notify admins and members
      targetRoles = [Roles.ADMIN, Roles.MEMBER];
    } else if (changerRole === Roles.ADMIN) {
      // If admin changed it, notify owner and members
      targetRoles = [Roles.OWNER, Roles.MEMBER];
    }

    // If no target roles (e.g., a member trying to change - shouldn't happen due to permissions)
    if (targetRoles.length === 0) {
      console.log('No target roles found for project name change notification');
      return [];
    }

    // Get role IDs for target roles
    const targetRoleObjects = await RoleModel.find({
      name: { $in: targetRoles }
    }).select('_id');

    const targetRoleIds = targetRoleObjects.map(role => role._id);

    // Find all members with target roles in this workspace (excluding the changer)
    const targetMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: targetRoleIds },
      userId: { $ne: changerUserId } // Exclude the person who made the change
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = targetMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for project name change notification');
      return [];
    }

    // Create notifications for all target users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.PROJECT_NAME_CHANGED,
        title: 'Project Name Changed',
        message: `${changer.name} changed project name from "${oldEmoji} ${oldName}" to "${newEmoji} ${newName}" in workspace "${workspace.name}"`,
        data: {
          workspaceName: workspace.name,
          projectId: projectId,
          oldProjectName: oldName,
          newProjectName: newName,
          oldProjectEmoji: oldEmoji,
          newProjectEmoji: newEmoji,
          changerName: changer.name,
          changerProfilePicture: changer.profilePicture,
          changerId: changerUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating project name changed notification:', error);
    throw error;
  }
};


// New service for project deleted notification
export const projectDeletedNotificationService = async (
  deleterUserId: string,
  workspaceId: string,
  projectName: string,
  projectEmoji: string
) => {
  try {
    // Get deleter and workspace details
    const [deleter, workspace] = await Promise.all([
      UserModel.findById(deleterUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name')
    ]);

    if (!deleter) {
      throw new Error('Deleter not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Get the deleter's role to determine who gets notified
    const deleterMember = await MemberModel.findOne({
      userId: deleterUserId,
      workspaceId: workspaceId
    }).populate('role', 'name').populate('userId', '_id');

    if (!deleterMember) {
      throw new Error('Deleter is not a member of this workspace');
    }

    const deleterRole = deleterMember.role.name;
    let targetRoles: string[] = [];

    // Determine who should receive notifications based on who deleted the project
    if (deleterRole === Roles.OWNER) {
      // If owner deleted it, notify admins and members
      targetRoles = [Roles.ADMIN, Roles.MEMBER];
    } else if (deleterRole === Roles.ADMIN) {
      // If admin deleted it, notify owner and members
      targetRoles = [Roles.OWNER, Roles.MEMBER];
    }

    // If no target roles (e.g., a member trying to delete - shouldn't happen due to permissions)
    if (targetRoles.length === 0) {
      console.log('No target roles found for project deletion notification');
      return [];
    }

    // Get role IDs for target roles
    const targetRoleObjects = await RoleModel.find({
      name: { $in: targetRoles }
    }).select('_id');

    const targetRoleIds = targetRoleObjects.map(role => role._id);

    // Find all members with target roles in this workspace (excluding the deleter)
    const targetMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: targetRoleIds },
      userId: { $ne: deleterUserId } // Exclude the person who deleted the project
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    const recipientUserIds = targetMembers.map(member => member.userId._id);

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for project deletion notification');
      return [];
    }

    // Create notifications for all target users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.PROJECT_DELETED,
        title: 'Project Deleted',
        message: `${deleter.name} has deleted project "${projectEmoji} ${projectName}" from workspace "${workspace.name}"`,
        data: {
          workspaceName: workspace.name,
          projectName: projectName,
          projectEmoji: projectEmoji,
          deleterName: deleter.name,
          deleterProfilePicture: deleter.profilePicture,
          deleterId: deleterUserId,
          workspaceId: workspaceId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);

    console.log(`Created ${savedNotifications.length} notifications for project deletion`);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating project deleted notification:', error);
    throw error;
  }
};


// New service for task assigned notification
export const taskAssignedNotificationService = async (
  assignerUserId: string,
  assignedUserId: string,
  workspaceId: string,
  taskId: string,
  taskTitle: string,
  projectId: string
) => {
  try {
    // Get assigner, assigned user, workspace, and project details
    const [assigner, assignedUser, workspace, project] = await Promise.all([
      UserModel.findById(assignerUserId).select('name profilePicture'),
      UserModel.findById(assignedUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('name emoji')
    ]);

    if (!assigner || !assignedUser || !workspace || !project) {
      throw new Error('Required data not found');
    }

    // Create notification for the assigned user
    const notification = new NotificationModel({
      userId: assignedUserId,
      type: Notifications.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: `${assigner.name} assigned you task "${taskTitle}" in project "${project.emoji} ${project.name}"`,
      data: {
        workspaceName: workspace.name,
        projectName: project.name,
        projectEmoji: project.emoji,
        taskId: taskId,
        taskTitle: taskTitle,
        assignerName: assigner.name,
        assignerProfilePicture: assigner.profilePicture,
        assignerId: assignerUserId,
        assignedName: assignedUser.name,
        assignedProfilePicture: assignedUser.profilePicture,
        assignedId: assignedUserId,
        workspaceId: workspaceId,
        projectId: projectId
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating task assigned notification:', error);
    throw error;
  }
};


// New service for task unassigned notification
export const taskUnassignedNotificationService = async (
  unassignerUserId: string,
  unassignedUserId: string,
  workspaceId: string,
  taskId: string,
  taskTitle: string,
  projectId: string
) => {
  try {
    // Don't send notification if user is unassigning themselves
    if (unassignerUserId === unassignedUserId) {
      return null;
    }

    // Get unassigner, unassigned user, workspace, and project details
    const [unassigner, unassignedUser, workspace, project] = await Promise.all([
      UserModel.findById(unassignerUserId).select('name profilePicture'),
      UserModel.findById(unassignedUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('name emoji')
    ]);

    if (!unassigner || !unassignedUser || !workspace || !project) {
      throw new Error('Required data not found');
    }

    // Create notification for the unassigned user ONLY
    // Don't notify the unassigner about their own action
    const notification = new NotificationModel({
      userId: unassignedUserId, // Only notify the person who was unassigned
      type: Notifications.TASK_UNASSIGNED,
      title: 'Task Unassigned',
      message: `${unassigner.name} removed you from task "${taskTitle}" in project "${project.emoji} ${project.name}"`,
      data: {
        workspaceName: workspace.name,
        projectName: project.name,
        projectEmoji: project.emoji,
        taskId: taskId,
        taskTitle: taskTitle,
        unassignerName: unassigner.name,
        unassignerProfilePicture: unassigner.profilePicture,
        unassignerId: unassignerUserId,
        unassignedName: unassignedUser.name,
        unassignedProfilePicture: unassignedUser.profilePicture,
        unassignedId: unassignedUserId,
        workspaceId: workspaceId,
        projectId: projectId
      }
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating task unassigned notification:', error);
    throw error;
  }
};


// New service for task status changed notification
export const taskStatusChangedNotificationService = async (
  changerUserId: string,
  taskId: string,
  taskTitle: string,
  oldStatus: string,
  newStatus: string,
  workspaceId: string,
  projectId: string,
  assignedUserId?: string
) => {
  try {
    // Get changer, workspace, and project details
    const [changer, workspace, project] = await Promise.all([
      UserModel.findById(changerUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('name emoji')
    ]);

    if (!changer || !workspace || !project) {
      throw new Error('Required data not found');
    }

    let recipientUserIds: string[] = [];

    // If task is assigned to someone and that person is not the one making the change
    if (assignedUserId && assignedUserId !== changerUserId) {
      recipientUserIds.push(assignedUserId);
    }

    // Get the changer's role to determine additional recipients
    const changerMember = await MemberModel.findOne({
      userId: changerUserId,
      workspaceId: workspaceId
    }).populate('role', 'name');

    if (changerMember) {
      const changerRole = changerMember.role.name;
      let targetRoles: string[] = [];

      // Determine who else should receive notifications based on who made the change
      if (changerRole === Roles.MEMBER) {
        // If member changed it, notify owner and admins
        targetRoles = [Roles.OWNER, Roles.ADMIN];
      } else if (changerRole === Roles.ADMIN) {
        // If admin changed it, notify owner
        targetRoles = [Roles.OWNER];
      }

      if (targetRoles.length > 0) {
        // Get role IDs for target roles
        const targetRoleObjects = await RoleModel.find({
          name: { $in: targetRoles }
        }).select('_id');

        const targetRoleIds = targetRoleObjects.map(role => role._id);

        // Find all members with target roles in this workspace (excluding the changer)
        const targetMembers = await MemberModel.find({
          workspaceId: workspaceId,
          role: { $in: targetRoleIds },
          userId: { $ne: changerUserId }
        }).populate('userId', '_id').select('userId');

        // Add target members to recipient list
        const additionalRecipients = targetMembers.map(member => member.userId._id.toString());
        recipientUserIds = [...recipientUserIds, ...additionalRecipients];
      }
    }

    // Remove duplicates
    recipientUserIds = [...new Set(recipientUserIds)];

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for task status change notification');
      return [];
    }

    // Create notifications for all recipients
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.TASK_STATUS_CHANGED,
        title: 'Task Status Changed',
        message: `${changer.name} changed status of task "${taskTitle}" from "${oldStatus}" to "${newStatus}" in project "${project.emoji} ${project.name}"`,
        data: {
          workspaceName: workspace.name,
          projectName: project.name,
          projectEmoji: project.emoji,
          taskId: taskId,
          taskTitle: taskTitle,
          oldStatus: oldStatus,
          newStatus: newStatus,
          changerName: changer.name,
          changerProfilePicture: changer.profilePicture,
          changerId: changerUserId,
          workspaceId: workspaceId,
          projectId: projectId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating task status changed notification:', error);
    throw error;
  }
};


// New service for task deleted notification
export const taskDeletedNotificationService = async (
  deleterUserId: string,
  workspaceId: string,
  projectId: string,
  taskId: string,
  taskTitle: string,
  assignedUserId?: string
) => {
  try {
    // Get deleter, workspace, and project details
    const [deleter, workspace, project] = await Promise.all([
      UserModel.findById(deleterUserId).select('name profilePicture'),
      WorkspaceModel.findById(workspaceId).select('name'),
      ProjectModel.findById(projectId).select('name emoji')
    ]);

    if (!deleter) {
      throw new Error('Deleter not found');
    }

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get the deleter's role to determine who gets notified
    const deleterMember = await MemberModel.findOne({
      userId: deleterUserId,
      workspaceId: workspaceId
    }).populate('role', 'name').populate('userId', '_id');

    if (!deleterMember) {
      throw new Error('Deleter is not a member of this workspace');
    }

    const deleterRole = deleterMember.role.name;
    let targetRoles: string[] = [];

    // Determine who should receive notifications based on who deleted the task
    if (deleterRole === Roles.OWNER) {
      // If owner deleted it, notify admins and members
      targetRoles = [Roles.ADMIN, Roles.MEMBER];
    } else if (deleterRole === Roles.ADMIN) {
      // If admin deleted it, notify owner and members
      targetRoles = [Roles.OWNER, Roles.MEMBER];
    }

    // If no target roles (e.g., a member trying to delete - shouldn't happen due to permissions)
    if (targetRoles.length === 0) {
      console.log('No target roles found for task deletion notification');
      return [];
    }

    // Get role IDs for target roles
    const targetRoleObjects = await RoleModel.find({
      name: { $in: targetRoles }
    }).select('_id');

    const targetRoleIds = targetRoleObjects.map(role => role._id);

    // Find all members with target roles in this workspace (excluding the deleter)
    const targetMembers = await MemberModel.find({
      workspaceId: workspaceId,
      role: { $in: targetRoleIds },
      userId: { $ne: deleterUserId } // Exclude the person who deleted the task
    }).populate('userId', '_id').select('userId');

    // Extract user IDs who should receive notifications
    let recipientUserIds = targetMembers.map(member => member.userId._id.toString());

    // If the task was assigned to someone who's not in the target roles, also notify them
    if (assignedUserId && assignedUserId !== deleterUserId && !recipientUserIds.includes(assignedUserId)) {
      recipientUserIds.push(assignedUserId);
    }

    // Remove duplicates
    recipientUserIds = [...new Set(recipientUserIds)];

    if (recipientUserIds.length === 0) {
      console.log('No recipients found for task deletion notification');
      return [];
    }

    // Create notifications for all target users
    const notificationPromises = recipientUserIds.map(async (userId) => {
      const notification = new NotificationModel({
        userId: userId,
        type: Notifications.TASK_DELETED,
        title: 'Task Deleted',
        message: `${deleter.name} has deleted task "${taskTitle}" from project "${project.emoji} ${project.name}"`,
        data: {
          workspaceName: workspace.name,
          projectName: project.name,
          projectEmoji: project.emoji,
          taskId: taskId,
          taskTitle: taskTitle,
          deleterName: deleter.name,
          deleterProfilePicture: deleter.profilePicture,
          deleterId: deleterUserId,
          workspaceId: workspaceId,
          projectId: projectId
        }
      });

      return notification.save();
    });

    // Save all notifications
    const savedNotifications = await Promise.all(notificationPromises);
    return savedNotifications;
  } catch (error) {
    console.error('Error creating task deleted notification:', error);
    throw error;
  }
};


export const getUserNotificationsService = async (userId: string, limit = 10) => {
  try {
    const notifications = await NotificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};


export const markNotificationAsReadService = async (notificationId: string, userId: string) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};


export const getUnreadNotificationCountService = async (userId: string) => {
  try {
    const count = await NotificationModel.countDocuments({
      userId,
      isRead: false
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};