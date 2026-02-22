import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ContactSupportCard = () => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <Mail className="w-4 h-4" /> Need Help?
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Our team is here to assist you with any questions or issues.
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
          <a href="mailto:Destiny@cBlakeEnt.com">
            <Mail className="w-4 h-4" /> Destiny@cBlakeEnt.com
          </a>
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
          <a href="tel:+16362066037">
            <Phone className="w-4 h-4" /> (636) 206-6037
          </a>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ContactSupportCard;
