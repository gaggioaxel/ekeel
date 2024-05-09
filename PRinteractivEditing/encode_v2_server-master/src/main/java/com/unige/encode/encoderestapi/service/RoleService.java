package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Role;
import com.unige.encode.encoderestapi.model.TopicType;

import java.util.Collection;
import java.util.List;

public interface RoleService {

    void saveRole(Role role);
    void saveAllRole(Collection<Role> roles);
    Role getRoleById(long id);
    List<Role> getRoleByAssociationTypeId(long associationTypeId);
    void updateRole(Role newRole, Role oldRole);
    void updateRoleTopicTypes(Role role, List<TopicType> topicTypes);
    void deleteRoleById(long id);
    boolean existsRoleById(long id);

}
