"use client";

import { Card, CardBody, Button } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiWeb, mdiPlus } from "@mdi/js";
import { AppLink } from "../Shared/AppLink";

export const EmptyState = ({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) => (
  <Card className="w-full">
    <CardBody className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 rounded-3xl flex items-center justify-center">
        <Icon path={mdiWeb} className="w-10 h-10 text-theme-primary" />
      </div>
      <h3 className="text-xl font-semibold text-theme-text mb-3">
        No pages yet
      </h3>
      <p className="text-theme-text-secondary mb-6 max-w-sm mx-auto">
        Get started by creating your first dashboard page to organize your Home
        Assistant controls.
      </p>

      {!canCreate ? (
        <>
          <p className="text-theme-text-secondary mb-6 max-w-sm mx-auto">
            You need to have at least one Home Assistant instance to create a
            page.
          </p>
          <AppLink href="/onboarding">
            <Button
              color="primary"
              size="lg"
              startContent={<Icon path={mdiPlus} className="w-5 h-5" />}
            >
              Connect Home Assistant
            </Button>
          </AppLink>
        </>
      ) : (
        <Button
          color="primary"
          size="lg"
          startContent={<Icon path={mdiPlus} className="w-5 h-5" />}
          isDisabled={!canCreate}
          onPress={onCreate}
        >
          Create First Page
        </Button>
      )}
    </CardBody>
  </Card>
);
