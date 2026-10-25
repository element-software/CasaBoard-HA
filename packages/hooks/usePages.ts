"use client";
import { useState, useEffect } from 'react';
import { Data } from "@measured/puck";
import { Page } from '@repo/types/page';
import { PageActions } from '@repo/lib';
import { Tools } from '@repo/utils';

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPages = await PageActions.getAllPages();
      setPages(fetchedPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (name: string, puckData: Data = { content: [], root: { props: {} } }) => {
    try {
      const slug = Tools.generateSlug(name);
      const newPage = await PageActions.createPage({
        name,
        slug,
        puck_data: puckData,
      });
      setPages(prev => [newPage, ...prev]);
      return newPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
      throw err;
    }
  };

  const updatePageData = async (slug: string, puckData: Data) => {
    try {
      const updatedPage = await PageActions.updatePage(slug, { puck_data: puckData });
      setPages(prev => 
        prev.map(page => 
          page.slug === slug ? updatedPage : page
        )
      );
      return updatedPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page');
      throw err;
    }
  };

  const deletePage = async (slug: string) => {
    try {
      await PageActions.deletePage(slug);
      setPages(prev => prev.filter(page => page.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
      throw err;
    }
  };

  const getPage = async (slug: string): Promise<Page | null> => {
    try {
      return await PageActions.getPage(slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get page');
      return null;
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  return {
    pages,
    loading,
    error,
    createPage,
    updatePageData,
    deletePage,
    getPage,
    refreshPages: loadPages,
  };
}
