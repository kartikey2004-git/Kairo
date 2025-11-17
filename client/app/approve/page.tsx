import DeviceApprovalContent from "@/components/DeviceApprovalContent";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <DeviceApprovalContent />
    </Suspense>
  );
};

export default page;
