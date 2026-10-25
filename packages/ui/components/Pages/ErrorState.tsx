import { Card, CardBody, Button } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiAlertCircle } from "@mdi/js";

export const ErrorState = ({ error }: { error: string }) => (
  <Card className="border-red-200 bg-red-50">
    <CardBody className="text-center py-6">
      <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
        <Icon path={mdiAlertCircle} className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Pages</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <Button color="primary" variant="flat" onPress={() => window.location.reload()}>
        Retry
      </Button>
    </CardBody>
  </Card>
);