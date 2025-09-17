import React from 'react';
import { 
  AdaptiveLayout, 
  AdaptiveContainer, 
  AdaptiveGrid, 
  AdaptiveGridItem,
  AdaptiveButton,
  AdaptiveForm,
  AdaptiveInput,
  AdaptiveModal,
  AdaptiveLayoutProvider 
} from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export function AdaptiveLayoutExample() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AdaptiveLayoutProvider>
      <AdaptiveLayout>
        <AdaptiveContainer variant="card" className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Adaptive Layout Example</h1>
          <p className="text-muted-foreground">
            This layout automatically adapts to your device type. Try viewing on different screen sizes!
          </p>
        </AdaptiveContainer>

        {/* Adaptive Grid Example */}
        <AdaptiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} className="mb-6">
          <AdaptiveGridItem>
            <Card>
              <CardHeader>
                <CardTitle>Mobile First</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card adapts to mobile screens first, then scales up.</p>
              </CardContent>
            </Card>
          </AdaptiveGridItem>
          
          <AdaptiveGridItem>
            <Card>
              <CardHeader>
                <CardTitle>Touch Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Buttons and interactions are optimized for touch devices.</p>
              </CardContent>
            </Card>
          </AdaptiveGridItem>
          
          <AdaptiveGridItem>
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Animations and features adapt based on device capabilities.</p>
              </CardContent>
            </Card>
          </AdaptiveGridItem>
        </AdaptiveGrid>

        {/* Adaptive Form Example */}
        <AdaptiveContainer variant="card" className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Adaptive Form</h2>
          <AdaptiveForm>
            <AdaptiveInput 
              label="Name" 
              placeholder="Enter your name"
              helperText="This input adapts its size based on your device"
            />
            <AdaptiveInput 
              label="Email" 
              type="email"
              placeholder="Enter your email"
            />
            <div className="flex gap-2 pt-4">
              <AdaptiveButton variant="default" fullWidthOnMobile>
                Submit
              </AdaptiveButton>
              <AdaptiveButton 
                variant="outline" 
                onClick={() => setShowModal(true)}
                fullWidthOnMobile
              >
                Open Modal
              </AdaptiveButton>
            </div>
          </AdaptiveForm>
        </AdaptiveContainer>

        {/* Adaptive Modal */}
        <AdaptiveModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Adaptive Modal"
        >
          <p className="mb-4">
            This modal automatically becomes a drawer on mobile devices and stays as a dialog on desktop.
          </p>
          <AdaptiveButton 
            onClick={() => setShowModal(false)}
            fullWidthOnMobile
          >
            Close
          </AdaptiveButton>
        </AdaptiveModal>
      </AdaptiveLayout>
    </AdaptiveLayoutProvider>
  );
}