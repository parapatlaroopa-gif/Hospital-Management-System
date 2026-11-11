from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role = getattr(getattr(request.user, "profile", None), "role", None)
        return role in self.allowed_roles


class IsAdmin(RolePermission):
    allowed_roles = ("ADMIN",)


class IsClinicalStaff(RolePermission):
    allowed_roles = ("DOCTOR", "NURSE")


class IsDoctor(RolePermission):
    allowed_roles = ("DOCTOR",)


class IsNurse(RolePermission):
    allowed_roles = ("NURSE",)


class IsPatient(RolePermission):
    allowed_roles = ("PATIENT",)


class IsHospitalUser(RolePermission):
    allowed_roles = ("ADMIN", "DOCTOR", "NURSE", "PATIENT")

