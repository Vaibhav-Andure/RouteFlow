import pandas as pd
from sqlmodel import Session, func, select

from app.models import AnalyticsResponse, AnalyticsSummary, DailyDeliveryStat, Delivery, DeliveryStatus


def get_delivery_analytics(session: Session) -> AnalyticsResponse:
    """
    Calculates and returns various delivery analytics.
    """
    # Fetch all deliveries
    deliveries = session.exec(select(Delivery)).all()

    if not deliveries:
        # Return default empty analytics if no deliveries exist
        return AnalyticsResponse(
            summary=AnalyticsSummary(
                total_deliveries=0,
                pending=0,
                in_transit=0,
                delivered=0,
                cancelled=0,
                completion_rate=0.0,
            ),
            daily_deliveries=[],
        )

    # Convert to DataFrame for easier processing
    df = pd.DataFrame([d.model_dump() for d in deliveries])

    # 1. Total Deliveries
    total_deliveries = len(df)

    # 2. Status Distribution
    status_counts = df["status"].value_counts().to_dict()
    pending = status_counts.get(DeliveryStatus.PENDING.value, 0)
    in_transit = status_counts.get(DeliveryStatus.IN_TRANSIT.value, 0)
    delivered = status_counts.get(DeliveryStatus.DELIVERED.value, 0)
    cancelled = status_counts.get(DeliveryStatus.CANCELLED.value, 0)

    # 3. Completion Rate
    completion_rate = (
        round((delivered / total_deliveries) * 100, 2) if total_deliveries > 0 else 0.0
    )

    # 4. Daily Deliveries
    # Ensure 'created_at' is datetime and extract date part
    df["created_date"] = pd.to_datetime(df["created_at"]).dt.date
    daily_counts = (
        df.groupby("created_date").size().reset_index(name="count")
    )
    daily_counts["date"] = daily_counts["created_date"].astype(str)
    daily_deliveries = [
        DailyDeliveryStat(date=row["date"], count=row["count"])
        for _, row in daily_counts[["date", "count"]].sort_values(by="date").iterrows()
    ]

    summary = AnalyticsSummary(
        total_deliveries=total_deliveries,
        pending=pending,
        in_transit=in_transit,
        delivered=delivered,
        cancelled=cancelled,
        completion_rate=completion_rate,
    )

    return AnalyticsResponse(summary=summary, daily_deliveries=daily_deliveries)
