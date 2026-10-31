'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import styles from './control-sizing-fixture.module.css';

export function ControlSizingFixture() {
  return (
    <div className={styles.container} data-testid="control-sizing-fixture">
      {/* 1. Default product sizing */}
      <section className={styles.section}>
        <h3 className={styles.title}>1. Product Default Control Sizing</h3>
        <p className={styles.description}>
          Omitted size prop automatically consumes the product default alias (Dashboard = 36px,
          Website = 48px).
        </p>
        <div className={styles.row}>
          <Button id="btn-default" variant="primary">
            Product Default Button
          </Button>
          <Button id="btn-secondary" variant="secondary">
            Secondary Default
          </Button>
        </div>
      </section>

      {/* 2. Complete approved six-step scale */}
      <section className={styles.section}>
        <h3 className={styles.title}>2. Approved Six-Step Control Scale</h3>
        <p className={styles.description}>
          Explicit sizes are strictly uniform across both Dashboard and Website starters.
        </p>
        <div className={styles.row}>
          <Button id="btn-size-xs" size="xs">
            XS (28px)
          </Button>
          <Button id="btn-size-sm" size="sm">
            SM (32px)
          </Button>
          <Button id="btn-size-md" size="md">
            MD (36px)
          </Button>
          <Button id="btn-size-lg" size="lg">
            LG (40px)
          </Button>
          <Button id="btn-size-xl" size="xl">
            XL (48px)
          </Button>
          <Button id="btn-size-2xl" size="2xl">
            2XL (56px)
          </Button>
        </div>
      </section>

      {/* 3. Touch-target policy */}
      <section className={styles.section}>
        <h3 className={styles.title}>3. Touch Target Policy</h3>
        <p className={styles.description}>
          Enforces minimum 48×48px interaction targets for touch devices without distorting desktop
          visual density.
        </p>
        <div className={styles.row}>
          <Button id="btn-touch-comfortable" touchTarget="comfortable" size="sm">
            Comfortable Touch Target (SM 32px visual, 48px target)
          </Button>
          <Button id="btn-touch-auto" touchTarget="auto" size="xs">
            Auto Touch Target (Coarse Pointer)
          </Button>
        </div>
      </section>

      {/* 4. Text resilience & label wrapping */}
      <section className={styles.section}>
        <h3 className={styles.title}>4. Text Resilience & Growth</h3>
        <p className={styles.description}>
          Minimum block size allows multiline expansion without clipping or overflow truncation.
        </p>
        <div className={styles.constrainedWrapper}>
          <Button id="btn-wrapped-label">
            Long French or Arabic description label that wraps naturally
          </Button>
        </div>
      </section>

      {/* 5. Disabled and loading states */}
      <section className={styles.section}>
        <h3 className={styles.title}>5. Loading & Disabled Stability</h3>
        <p className={styles.description}>
          Loading and disabled controls preserve identical dimensions with zero layout shift.
        </p>
        <div className={styles.row}>
          <Button id="btn-loading" loading>
            Saving Changes
          </Button>
          <Button id="btn-disabled" disabled>
            Disabled Control
          </Button>
        </div>
      </section>
    </div>
  );
}
