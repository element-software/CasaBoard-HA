"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardConfig } from '@repo/config';
import { dashboardConfig as defaultConfig } from '@repo/config';
import { PageActions, clientLogger } from '@repo/lib';

interface ConfigurationContextType {
  config: DashboardConfig;
  updateConfig: (newConfig: DashboardConfig) => void;
  resetConfig: () => void;
  saveConfig: () => string;
  importConfig: (configString: string) => boolean;
  exportConfig: () => string;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export const useConfiguration = (): ConfigurationContextType => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

interface ConfigurationProviderProps {
  children: ReactNode;
  initialConfig?: DashboardConfig;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ 
  children, 
  initialConfig = defaultConfig 
}) => {
  const [config, setConfig] = useState<DashboardConfig>(initialConfig);

  const updateConfig = async (newConfig: DashboardConfig) => {
    setConfig(newConfig);

    for (const [slug, pageConfig] of Object.entries(newConfig.pages)) {
      try {
        await PageActions.updatePage(slug, {
          name: pageConfig.title?.value || slug,
          puck_data: pageConfig.puckData
        });
      } catch (error) {
        clientLogger.warn('ConfigurationProvider', `Failed to update page ${slug}`, error);
      }
    }
  };

  const resetConfig = async () => {
    setConfig(defaultConfig);
    // Note: We don't delete pages on reset, just reset the local config
  };

  const saveConfig = (): string => {
    const configData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      config: config
    };
    return JSON.stringify(configData, null, 2);
  };

  const importConfig = (configString: string): boolean => {
    try {
      const data = JSON.parse(configString);
      const newConfig = data.config || data; // Handle both wrapped and unwrapped formats
      setConfig(newConfig);
      localStorage.setItem('dashboardConfig', JSON.stringify(newConfig));
      return true;
    } catch (error) {
      clientLogger.error('ConfigurationProvider', 'Failed to import configuration', error);
      return false;
    }
  };

  const exportConfig = (): string => {
    return saveConfig();
  };

  const value: ConfigurationContextType = {
    config,
    updateConfig,
    resetConfig,
    saveConfig,
    importConfig,
    exportConfig,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};
