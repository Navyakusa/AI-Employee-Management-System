package com.ems.service;

import com.ems.entity.Settings;
import com.ems.repository.SettingsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public Settings getSettings() {

        List<Settings> settings = settingsRepository.findAll();

        if (settings.isEmpty()) {
            return null;
        }

        return settings.get(0);
    }

    // Save settings
    public Settings saveSettings(Settings updatedSettings) {

        Settings existingSettings = getSettings();

        if (existingSettings == null) {

            if (updatedSettings.getAllowUserRegistrations() == null) {
                updatedSettings.setAllowUserRegistrations(true);
            }

            if (updatedSettings.getEmailNotifications() == null) {
                updatedSettings.setEmailNotifications(true);
            }

            if (updatedSettings.getMaintenanceMode() == null) {
                updatedSettings.setMaintenanceMode(false);
            }

            return settingsRepository.save(updatedSettings);
        }

        existingSettings.setOrganizationName(
                updatedSettings.getOrganizationName()
        );

        existingSettings.setSupportEmail(
                updatedSettings.getSupportEmail()
        );

        existingSettings.setWebsite(
                updatedSettings.getWebsite()
        );

        existingSettings.setAllowUserRegistrations(
                updatedSettings.getAllowUserRegistrations()
        );

        existingSettings.setEmailNotifications(
                updatedSettings.getEmailNotifications()
        );

        existingSettings.setMaintenanceMode(
                updatedSettings.getMaintenanceMode()
        );

        return settingsRepository.save(existingSettings);
    }
}